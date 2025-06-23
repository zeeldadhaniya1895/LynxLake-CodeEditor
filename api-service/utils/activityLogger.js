const { executeQuery } = require("./dbUtils");
const queries = require("../queries/project");
const { v4: uuidv4 } = require("uuid");

// Activity logging helper
const logActivity = async (req, projectId, username, action, details = {}) => {
    try {
        const activityId = uuidv4();
        await executeQuery(queries.logProjectActivity, [
            activityId,
            projectId,
            username,
            action,
            JSON.stringify(details),
            req.ip,
            req.get('User-Agent')
        ]);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = {
    logActivity
}; 