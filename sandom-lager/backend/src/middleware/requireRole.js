// Middleware to check if the user has one of the allowed roles

function requireRole(...allowedRoles) {
    return (req, res, next) => {
       try {
        const userRole = req.user?.role;
        if (!userRole) {
            return res.status(403).json({ message: "User role not found" });
        }
        
       if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "Access denied: insufficient permissions" });
        }
        next();
       } catch (err) {
        console.error("Error in requireRole middleware:", err);
        res.status(500).json({ message: "Internal server error in role checking"});
       }
    };
}

module.exports = { requireRole };