const pool = require("../../db");
const queries = require("../../queries/project");

const getLogs = async (req, res) => {
  const { projectId } = req.params;

  try {
    const results = await pool.query(queries.getLogs, [projectId]);
    return res.status(200).json(results.rows);
  } catch (err) {
    console.error("Error fetching logs:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getMessages = async (req, res) => {
  const { projectId } = req.params;
  try {
    const results = await pool.query(queries.getMessages, [projectId]);
    return res.status(200).json(results.rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getLogs,
  getMessages,
}; 