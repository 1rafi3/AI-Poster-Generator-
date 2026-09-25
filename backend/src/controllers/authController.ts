import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, emailOrPhone, password } = req.body;

    if (!name || !emailOrPhone || !password) {
      res.status(400).json({ success: false, message: 'Name, email/phone, and password are required.' });
      return;
    }

    const existingUser = await User.findOne({ emailOrPhone: emailOrPhone.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'User with this email or phone already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // First user or admin check
    const isFirstUser = (await User.countDocuments()) === 0;
    const role = isFirstUser || emailOrPhone.includes('admin') ? 'admin' : 'user';

    const user = await User.create({
      name,
      emailOrPhone: emailOrPhone.toLowerCase(),
      passwordHash,
      role,
    });

    const token = generateToken({
      id: user._id.toString(),
      emailOrPhone: user.emailOrPhone,
      name: user.name,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        emailOrPhone: user.emailOrPhone,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error during registration.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      res.status(400).json({ success: false, message: 'Email/phone and password are required.' });
      return;
    }

    const user = await User.findOne({ emailOrPhone: emailOrPhone.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      return;
    }

    const token = generateToken({
      id: user._id.toString(),
      emailOrPhone: user.emailOrPhone,
      name: user.name,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        emailOrPhone: user.emailOrPhone,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error during login.' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
