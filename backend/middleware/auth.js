const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from the token
            req.user = await userRepository.findByIdWithSelect(decoded.id);
            
            if (!req.user) {
                console.error(`[Auth Error] User not found for ID: ${decoded.id}`);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Set active branch (header override or user's default)
            const branchHeader = req.headers['x-branch'];
            if (branchHeader && req.user.branches.includes(branchHeader)) {
                req.activeBranch = branchHeader;
            } else {
                req.activeBranch = req.user.activeBranch || 'Main Branch';
            }

            next();
        } catch (error) {
            console.error('[Auth Error] Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.error('[Auth Error] No token provided');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
