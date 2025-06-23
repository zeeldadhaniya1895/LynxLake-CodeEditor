const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

const insertAndGetNewNodeToFileExplorer = async (username, project_id, new_node_parent_id, name, is_folder) => {
    // Prevent creation of additional root folders
    if (new_node_parent_id === null) {
        // Only allow root folder creation during project creation, not via socket
        return null;
    }
    const uniqueIdFileTree = uuidv4(); //file_tree_id is file_id
    const insertQuery = `INSERT INTO file_tree (file_tree_id, project_id, parent_id, name, is_folder) VALUES ($1, $2, $3, $4, $5)`;
    await pool.query(insertQuery, [
        uniqueIdFileTree,
        project_id,
        new_node_parent_id,
        name,
        is_folder,
    ]);

    if (!is_folder) {
        const file_extension = name.split(".").pop().toLowerCase();
        await pool.query(
            `
        INSERT INTO files (file_id, project_id, file_created_by, file_name, file_extension)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (file_id) DO NOTHING;
        `,
            [uniqueIdFileTree, project_id, username, name, file_extension]
        );
    }

    const getQuery = `SELECT * FROM file_tree WHERE file_tree_id = $1`;
    const result = await pool.query(getQuery, [uniqueIdFileTree]);

    return result.rows[0];
};

const deleteFileAndChildren = async (fileTreeId) => {
    // Step 1: Get the file_tree_ids of the node and its descendants
    const getDescendantsQuery = `
      WITH RECURSIVE descendants AS (
          SELECT file_tree_id
          FROM file_tree
          WHERE file_tree_id = $1
          UNION ALL
          SELECT f.file_tree_id
          FROM file_tree f
          INNER JOIN descendants d ON f.parent_id = d.file_tree_id
      )
      SELECT file_tree_id FROM descendants;
    `;

    try {
        // Get all the descendants
        const descendantsResult = await pool.query(getDescendantsQuery, [fileTreeId]);

        for (let i = descendantsResult.rows.length - 1; i >= 0; i--) {
            const { file_tree_id } = descendantsResult.rows[i];

            await pool.query(
                "DELETE FROM file_tree_expand_user WHERE file_tree_id = $1",
                [file_tree_id]
            );
        }

        for (let i = descendantsResult.rows.length - 1; i >= 0; i--) {
            const { file_tree_id } = descendantsResult.rows[i];

            await pool.query("DELETE FROM file_tree WHERE file_tree_id = $1", [
                file_tree_id,
            ]);
        }

        for (let i = descendantsResult.rows.length - 1; i >= 0; i--) {
            const { file_tree_id } = descendantsResult.rows[i];

            await pool.query("DELETE FROM live_users WHERE file_id = $1", [
                file_tree_id,
            ]);
        }

        for (let i = descendantsResult.rows.length - 1; i >= 0; i--) {
            const { file_tree_id } = descendantsResult.rows[i];

            await pool.query("DELETE FROM files WHERE file_id = $1", [file_tree_id]);
        }
    } catch (err) {
        console.error("Error deleting files:", err);
    }
};

module.exports = {
    insertAndGetNewNodeToFileExplorer,
    deleteFileAndChildren,
}; 