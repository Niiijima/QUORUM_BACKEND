import * as authService from './auth.service.js';

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function register(req, res, next) {
    try {
        const newUser = await authService.register(req.body);
        res.status(201).json({ success: true, data: newUser });
    } catch (err) {
        next(err);
    }
}