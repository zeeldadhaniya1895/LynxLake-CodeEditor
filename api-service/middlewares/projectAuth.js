const pool = require("../db");
const queries = require("../queries/project");

// Role-based access control middleware
const checkProjectAccess = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { username } = req.user;
        console.log('[checkProjectAccess] projectId:', projectId, '| username:', username);
        
        const result = await pool.query(queries.checkProjectAccess, [projectId, username]);
        console.log('[checkProjectAccess] DB result:', result.rows);
        
        if (result.rows.length === 0) {
            console.warn('[checkProjectAccess] Access denied for user:', username, 'on project:', projectId);
            return res.status(403).json({ 
                error: 'Access denied. You need permission to access this project.' 
            });
        }
        
        req.userRole = result.rows[0].role;
        next();
    } catch (error) {
        console.error('[checkProjectAccess] Error checking project access:', error, '| projectId:', req.params.projectId, '| username:', req.user?.username);
        res.status(500).json({ error: 'Error checking project access' });
    }
};

// Role-based permission middleware
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ 
                error: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
            });
        }
        next();
    };
};

module.exports = {
    checkProjectAccess,
    requireRole
}; 