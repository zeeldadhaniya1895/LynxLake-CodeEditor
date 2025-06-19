const pool = require("../db");
const queries = require("../queries/user");
const jwt = require("jsonwebtoken");
const config = require("../config");

const getUser = async (req, res) => {
    try {
        const { rows } = await pool.query(queries.getUser, [req.user.id]);
        return res.status(200).json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching user data" });
    }
}

const updateUser = async (req, res) => {
    try {
        const { name, username } = req.body;

        // Check if the new username already exists for another user
        if (username) {
            const existingUser = await pool.query(queries.checkUsernameExists, [username, req.user.id]);
            if (existingUser.rows.length > 0) {
                return res.status(409).json({ message: "Username already taken. Please choose a different one." });
            }
        }

        // Update user data including username
        await pool.query(queries.updateUser, [name, username, req.user.id]);
        
        // If username was updated, generate a new token to reflect the change
        const newTokenUsername = username || req.user.username;
        const token = jwt.sign(
            { id: req.user.id, username: newTokenUsername, image: req.user.image },
            config.JWT_SECRET_KEY,
            { expiresIn: config.JWT_TIMEOUT }
        );

        return res.status(200).json({ message: "User updated successfully", authToken: token, username: newTokenUsername, image: req.user.image });
    } catch (error) {
        console.error("Error updating user data:", error);
        return res.status(500).json({ message: "Error updating user data" });
    }
}

const updateProfileImage = async (req, res) => {
    try {
        const { profile_image } = req.body;
        const { id, username } = req.user;

        await pool.query(queries.updateProfileImage, [profile_image, id]);

        const token = jwt.sign(
            { id, username, image: profile_image },
            config.JWT_SECRET_KEY,
            { expiresIn: config.JWT_TIMEOUT }
        );

        // res.cookie("authToken", token, {
        //     path: "/", // This allows the cookie to be accessible on all routes
        //     maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        //     sameSite: 'None', // Allows cross-site cookie usage
        //     secure: true, // Ensures the cookie is sent over HTTPS only
        // });

        // res.cookie("username", username, {
        //     path: "/", // This allows the cookie to be accessible on all routes
        //     maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        //     sameSite: 'None', // Allows cross-site cookie usage
        //     secure: true, // Ensures the cookie is sent over HTTPS only
        // });

        // res.cookie("image", profile_image, {
        //     path: "/", // This allows the cookie to be accessible on all routes
        //     maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        //     sameSite: 'None', // Allows cross-site cookie usage
        //     secure: true, // Ensures the cookie is sent over HTTPS only
        // });

        return res.status(200).json({ message: "Profile image updated successfully", authToken: token, username, image: profile_image });
    } catch (error) {
        return res.status(500).json({ message: "Error updating profile image" });
    }
}

module.exports = {
    getUser,
    updateUser,
    updateProfileImage,
};
