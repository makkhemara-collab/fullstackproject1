const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user is set by your existing validate_token middleware
        if (!req.user || !req.user.email) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // You will need to attach the role to the token in userController.js during login
        // For now, let's assume req.user.role exists
        if (allowedRoles.includes(req.user.role)) {
            next(); // They have permission, let them through
        } else {
            res.status(403).json({ success: false, message: "Access Denied: You do not have permission to do this." });
        }
    };
};

module.exports = { requireRole };