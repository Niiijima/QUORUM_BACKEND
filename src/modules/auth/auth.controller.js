import * as authService from './auth.service.js';

// LOGIN: Sets HTTP-Only Cookie and returns user data
export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        // Business logic handles validation and JWT generation
        const { token, user } = await authService.login(email, password);

        // Securely set the JWT as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,                                // Prevents XSS/JS access
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax',                           // Mitigates CSRF
            maxAge: 3600000                               // 1 hour expiry
        });

        // Response body contains only user info, NOT the token
        res.status(200).json({ 
            success: true, 
            data: { user } 
        });
    } catch (err) {
        next(err);
    }
}

// LOGOUT: Clears the session cookie
export async function logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
}

// GET ME: Retrieves the current user from the 'protect' middleware
export async function getMe(req, res, next) {
    try {
        // 'protect' middleware has already populated req.user
        res.status(200).json({ success: true, data: req.user });
    } catch (err) {
        next(err);
    }
}

// REGISTER: Standard user creation
export async function register(req, res, next) {
    try {
        const newUser = await authService.register(req.body);
        res.status(201).json({ success: true, data: newUser });
    } catch (err) {
        next(err);
    }
}