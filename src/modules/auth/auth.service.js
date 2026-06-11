// src/modules/auth/auth.service.js
import User from '../../models/User.js'; // adjust path if needed
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (userData) => {
  const { name, email, password, ...rest } = userData;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    ...rest
  });

  // Generate token
  const token = jwt.sign(
    { id: newUser._id, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email
    },
    token
  };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    token
  };
};