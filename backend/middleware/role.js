const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({ error: "Access denied" });
        }
        next();
    };
};

export default roleMiddleware;