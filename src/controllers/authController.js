import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js'; // Ensure the path is correct
import { register as registerService } from '../auth/auth.service.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Call the service we defined earlier
    const result = await registerService({ name, email, password });

    res.status(201).json({
      success: true,
      user: result.user,
      token: result.token
    });

  } catch (error) {
    // Check for Mongoose duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    console.error("Registration Error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};