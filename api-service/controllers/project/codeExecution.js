const pool = require("../../db");
const queries = require("../../queries/project");
const { logActivity } = require("../../utils/activityLogger");

const executeCode = async (req, res) => {
  const { lang, code, input } = req.body;

  console.log("executeCode: Received parameters:", { lang, code, input });

  try {
    // Here you would integrate with a code execution engine/API
    // For demonstration, let's just echo the code and language
    const output = `Executed ${lang} code with input: ${input}. Your code: ${code}`;
    console.log("executeCode: Generated output:", output);
    
    res.status(200).json({
      output: output,
      error: null,
    });
  } catch (err) {
    console.error("Error executing code:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  executeCode,
}; 