const pool = require("../db");
const { v4: uuidv4 } = require("uuid");
const registerFileTreeSocketHandlers = require('./fileTreeSocket');
const { insertAndGetNewNodeToFileExplorer, deleteFileAndChildren } = require('./fileTreeUtils');

// Query to insert live users
const insertLiveUser = async (project_id, fileId, username) => {
    if (!username || !fileId) {
        return;
    }
    try {
        const existingUser = await pool.query(
            `SELECT * FROM live_users WHERE file_id = $1 AND username = $2`,
            [fileId, username]
        );

        if (existingUser.rows.length > 0) {
            try {
                await pool.query(
                    `UPDATE live_users SET is_active_in_tab = TRUE, is_live = TRUE, live_users_timestamp = CURRENT_TIMESTAMP WHERE file_id = $1 AND username = $2`,
                    [fileId, username]
                );
            } catch (err) {
                console.error("Error updating live user:", err);
            }
        } else {
            try {
                // Get user role from project_owners table
                const userRoleResult = await pool.query(
                    `SELECT role FROM project_owners WHERE project_id = $1 AND username = $2`,
                    [project_id, username]
                );
                
                const userRole = userRoleResult.rows.length > 0 ? userRoleResult.rows[0].role : 'viewer';
                
                await pool.query(
                    `
            INSERT INTO live_users (file_id, project_id, username, user_role, is_active_in_tab, is_live, live_users_timestamp)
            VALUES ($1, $2, $3, $4, TRUE, TRUE, CURRENT_TIMESTAMP)
            ON CONFLICT (file_id, username) DO NOTHING;
            `,
                    [fileId, project_id, username, userRole]
                );
            } catch (err) {
                console.error("Error inserting live user:", err);
            }
        }
    } catch (err) {
        console.error("Error getting live user:", err);
    }
};

// Query to remove live users
const removeLiveUser = async (fileId, username) => {
    const query = "DELETE FROM live_users WHERE file_id = $1 AND username = $2;";
    await pool.query(query, [fileId, username]);
};

const removeActiveLiveUser = async (username) => {
    const query = `UPDATE live_users SET is_live = FALSE WHERE username = $1;`;
    await pool.query(query, [username]);
};

// Query to get live users in a file
const getLiveUsersInFile = async (project_id, fileId, username) => {
    const query = `SELECT f.*, lu.*, f.file_id AS id FROM files AS f LEFT JOIN live_users AS lu ON f.file_id = lu.file_id WHERE lu.file_id = $1 AND lu.username = $2 AND lu.project_id = $3;`;
    const res = await pool.query(query, [fileId, username, project_id]);
    return res.rows;
};

const getALiveUserInFile = async (fileId, username) => {
    const query = `SELECT * FROM live_users WHERE file_id = $1 AND username = $2;`;
    const res = await pool.query(query, [fileId, username]);
    return res.rows[0];
};

const getAllLiveUserInFile = async (fileId) => {
    const query = `SELECT lu.*, u.profile_image AS image FROM live_users AS lu JOIN users AS u ON u.username = lu.username WHERE file_id = $1`;
    const res = await pool.query(query, [fileId]);
    return res.rows;
};

const insertNewLog = async (file_id, newLog, project_id, username) => {
    const { origin, removed, text, from_line, from_ch, to_line, to_ch } = newLog;

    // Get user role from project_owners table
    let user_role = 'viewer'; // default role
    try {
        const roleQuery = `SELECT role FROM project_owners WHERE project_id = $1 AND username = $2`;
        const roleResult = await pool.query(roleQuery, [project_id, username]);
        if (roleResult.rows.length > 0) {
            user_role = roleResult.rows[0].role;
        }
    } catch (error) {
        console.error("Error fetching user role:", error);
    }

    const query = `INSERT INTO logs (
        file_id, 
        project_id,
        username,
        user_role,
        action_type,
        origin,
        removed, 
        text,
        from_line,
        from_ch,
        to_line,
        to_ch
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
    `;

    const parameters = [file_id, project_id, username, user_role, 'edit', origin, removed, text, from_line, from_ch, to_line, to_ch];

    try {
        await pool.query(query, parameters);
    } catch (error) {
        console.error("Error inserting new log:", error);
    }
};

const insertChatMessage = async (project_id, username, message, time) => {
    // Get user role from project_owners table
    let user_role = 'viewer'; // default role
    try {
        const roleQuery = `SELECT role FROM project_owners WHERE project_id = $1 AND username = $2`;
        const roleResult = await pool.query(roleQuery, [project_id, username]);
        if (roleResult.rows.length > 0) {
            user_role = roleResult.rows[0].role;
        }
    } catch (error) {
        console.error("Error fetching user role:", error);
    }

    const query = `INSERT INTO chat_messages (project_id, username, user_role, message, created_at) VALUES ($1, $2, $3, $4, $5);`;
    const parameters = [project_id, username, user_role, message, time];

    try {
        await pool.query(query, parameters);
    } catch (error) {
        console.error("Error inserting chat message:", error);
    }
};

const updateLastOpened = async (project_id, username) => {
    if (!project_id || !username) return;

    const query =
        `
        UPDATE project_owners
        SET last_opened = CURRENT_TIMESTAMP
        WHERE project_id = $1
        AND username = $2;
        `;
    try {
        await pool.query(query, [project_id, username]);
    } catch (error) {
        console.log(error);
    }
};

const socketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log("New socket connection:", socket.id);
        socket.setMaxListeners(100);

        let project_id = null;
        let username = null;

        socket.on("editor:join-project", async ({ project_id: pid, username: uname, image }) => {
            project_id = pid;
            username = uname;
            socket.join(project_id);
            await updateLastOpened(project_id, username);

            // Handle user leaving from editor
            socket.on("editor:live-user-left-from-editor", (data) => {
                const leaveData = {
                    ...data,
                    project_id: data.project_id || project_id
                };
                io.to(project_id).emit("editor:live-user-left", leaveData);
            });

            // Broadcast user joined to others
            socket.broadcast.to(project_id).emit("editor:live-user-joined", { username, image, project_id });
            
            // Send back user joined event
            socket.on("editor:live-user-joined-send-back", (data) => {
                const joinData = {
                    ...data,
                    project_id: data.project_id || project_id
                };
                io.to(project_id).emit("editor:live-user-joined-send-back", joinData);
            });

            // File explorer operations
            socket.on("file-explorer:insert-node", async ({ new_node_parent_id, name, is_folder }) => {
                console.log("Inserting node:", { new_node_parent_id, name, is_folder });
                const new_node = await insertAndGetNewNodeToFileExplorer(
                    username,
                    project_id,
                    new_node_parent_id,
                    name,
                    is_folder
                );
                io.to(project_id).emit("file-explorer:insert-node", { ...new_node, project_id });
            });

            socket.on("file-explorer:delete-node", async ({ node_id }) => {
                console.log("Deleting node:", node_id);
                await deleteFileAndChildren(node_id);
                io.to(project_id).emit("file-explorer:delete-node", { node_id, project_id });
            });

            // Code editor operations
            socket.on("code-editor:send-change", async (data) => {
                console.log("Code change received:", { file_id: data.file_id, username });
                // Add project_id and username to the data if not present
                const changeData = {
                    ...data,
                    project_id: data.project_id || project_id,
                    username: data.username || username
                };
                socket.broadcast.to(project_id).emit("code-editor:receive-change", changeData);
                
                // Save log if provided
                if (data.newLog) {
                    await insertNewLog(data.file_id, data.newLog, project_id, username);
                }
            });

            // Cursor operations
            socket.on("code-editor:send-cursor", (data) => {
                console.log("Cursor position received:", { file_id: data.file_id, username: data.username });
                // Add project_id and username to the data if not present
                const cursorData = {
                    ...data,
                    project_id: data.project_id || project_id,
                    username: data.username || username
                };
                io.to(project_id).emit("code-editor:receive-cursor", cursorData);
            });

            socket.on("code-editor:remove-cursor", (data) => {
                console.log("Remove cursor:", data);
                // Add project_id and username to the data if not present
                const cursorData = {
                    ...data,
                    project_id: data.project_id || project_id,
                    username: data.username || username
                };
                socket.broadcast.to(project_id).emit("code-editor:remove-cursor", cursorData);
            });

            // Live users management
            socket.on("code-editor:load-live-users", async ({ file_id }) => {
                console.log("Loading live users for file:", file_id);
                io.to(project_id).emit("code-editor:load-live-users", { file_id, project_id });
            });

            socket.on("code-editor:load-live-users-send-back", async (data) => {
                console.log("Live users data received:", data);
                const allUsers = await getAllLiveUserInFile(data.file_id);
                io.to(project_id).emit("code-editor:load-live-users-send-back", { allUsers, project_id });
            });

            socket.on("code-editor:join-file", async ({ file_id }) => {
                console.log("User joining file:", { file_id, username });
                await insertLiveUser(project_id, file_id, username);

                const allUsers = await getAllLiveUserInFile(file_id);
                socket.emit("code-editor:load-live-users", { allUsers, project_id });

                // Notify others about user joining
                const aUser = await getALiveUserInFile(file_id, username);
                io.to(project_id).emit("code-editor:user-joined", { aUser, image, project_id });

                // Handle user leaving file
                socket.on("code-editor:leave-file", async ({ file_id }) => {
                    console.log("User leaving file:", { file_id, username });
                    await removeLiveUser(file_id, username);
                    socket.broadcast
                        .to(project_id)
                        .emit("code-editor:user-left", { file_id, username, project_id });
                });
            });

            // Chat operations
            socket.on("chat:send-message", async (data) => {
                // If AI message, preserve username, image, isAI
                let emitData = {
                    message: data.message,
                    time: data.time,
                    image: data.image || image,
                    username: data.username || username,
                    isAI: data.isAI || false,
                    socketId: socket.id,
                    project_id
                };
                // Insert chat message with correct username
                await insertChatMessage(project_id, emitData.username, emitData.message, emitData.time);
                io.to(project_id).emit("chat:receive-message", emitData);
            });

            // Project operations
            socket.on("project:delete-project", async (data) => {
                console.log("Project deletion requested:", data);
                const deleteData = {
                    ...data,
                    project_id: data.project_id || project_id
                };
                io.to(project_id).emit("project:delete-project", deleteData);
            });

            // Handle disconnect
            socket.on("disconnect", async () => {
                console.log("User disconnected:", username);
                io.to(project_id).emit("editor:live-user-left", { username, project_id });

                socket.broadcast
                    .to(project_id)
                    .emit("code-editor:remove-all-cursor", { username, project_id });

                await removeActiveLiveUser(username);
                socket.broadcast
                    .to(project_id)
                    .emit("code-editor:remove-active-live-user", { username, project_id });
            });
        });

        // Register file tree/file manager real-time handlers
        registerFileTreeSocketHandlers(
          io,
          socket,
          () => project_id,
          () => username
        );
    });
}

module.exports = {
  socketHandlers,
  insertAndGetNewNodeToFileExplorer,
  deleteFileAndChildren,
  // add other exports if needed
};