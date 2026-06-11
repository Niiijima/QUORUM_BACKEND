import * as authService from './auth.service.js';

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        // Call your service to verify credentials and generate a token
        const result = await authService.login(email, password);
        
        res.status(200).json({
            success: true,
            data: result // Usually contains the token and user info
        });
    } catch (err) {
        next(err);
    }
}

export async function register(req, res, next) {
    try {
        const userData = req.body;
        const newUser = await authService.register(userData);
        res.status(201).json({
            success: true,
            data: newUser
        });
    } catch (err) {
        next(err);
    }
}