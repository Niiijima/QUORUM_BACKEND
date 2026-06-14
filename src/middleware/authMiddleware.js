import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    // Check for token in the Authorization header OR in cookies
    const authHeader = req.headers['authorization'];
    
    const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : req.cookies?.token; // Looks for the 'token' cookie automatically

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "Access denied. No token provided." 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Normalize payload: handle both 'id' and 'userId' naming conventions
        req.user = {
            id: decoded.id || decoded.userId,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false,
            message: "Invalid or expired token." 
        });
    }
};

export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
        }
        
        next();
    };
};

export default { 
    authMiddleware, 
    authorize 
};