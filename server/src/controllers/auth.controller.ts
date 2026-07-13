import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { dispatchUserLogin } from '../utils/notificationDispatcher';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-12345';

const signAccessToken = (id: string) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '15m' });
};

const signRefreshToken = (id: string) => {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const parseUserAgent = (userAgent: string = '') => {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let device = 'Desktop';

  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';

  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Macintosh')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) { os = 'Android'; device = 'Mobile'; }
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) { os = 'iOS'; device = 'Mobile'; }

  return { browser, os, device };
};

const sendTokenResponse = async (user: any, statusCode: number, req: Request, res: Response) => {
  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  // Parse User-Agent
  const ua = parseUserAgent(req.headers['user-agent']);
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  // Add refresh token to user array
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);

  // Update activity log & history
  user.lastLogin = new Date();
  user.lastActive = new Date();
  
  user.loginHistory.push({
    timestamp: new Date(),
    success: true,
    ipAddress: ip,
    device: ua.device,
    browser: ua.browser,
    location: ip === '127.0.0.1' || ip === '::1' ? 'Local Development' : 'Chennai, India'
  });

  user.activityTimeline.push({
    action: 'Login',
    description: `Successful login from ${ua.browser} on ${ua.os}`,
    date: new Date(),
    ipAddress: ip
  });

  await user.save({ validateBeforeSave: false });

  await dispatchUserLogin(user, ip);

  // Cook options
  const isProd = process.env.NODE_ENV === 'production';
  
  res.cookie('jwt', accessToken, {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict' as const
  });

  res.cookie('refreshToken', refreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict' as const,
    path: '/api/auth' // Only send to auth endpoints
  });

  user.password = undefined;
  user.refreshTokens = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    refreshToken,
    data: {
      user
    }
  });
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ status: 'error', message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({ status: 'error', message: 'Incorrect email or password' });
      return;
    }

    // Check if account is locked
    if (user.isLocked) {
      if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
        const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
        res.status(423).json({ 
          status: 'error', 
          message: `Account is temporarily locked. Try again in ${remainingMinutes} minutes.` 
        });
        return;
      } else {
        // Unlock account
        user.isLocked = false;
        user.lockUntil = undefined;
        user.failedAttempts = 0;
        await user.save({ validateBeforeSave: false });
      }
    }

    const isPasswordCorrect = await user.comparePassword(password);
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const ua = parseUserAgent(req.headers['user-agent']);

    if (!isPasswordCorrect) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      
      user.loginHistory.push({
        timestamp: new Date(),
        success: false,
        ipAddress: ip,
        device: ua.device,
        browser: ua.browser,
        location: ip === '127.0.0.1' || ip === '::1' ? 'Local Development' : 'Chennai, India'
      });

      if (user.failedAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        user.activityTimeline.push({
          action: 'Account Locked',
          description: 'Account locked due to 5 consecutive failed login attempts',
          date: new Date(),
          ipAddress: ip
        });
      }

      await user.save({ validateBeforeSave: false });

      res.status(401).json({ 
        status: 'error', 
        message: user.isLocked 
          ? 'Account locked due to too many failed attempts. Please try again in 15 minutes.' 
          : 'Incorrect email or password' 
      });
      return;
    }

    // Reset lock details on successful login
    user.failedAttempts = 0;
    user.isLocked = false;
    user.lockUntil = undefined;

    await sendTokenResponse(user, 200, req, res);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      // Decode user ID and pull token
      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
          user.activityTimeline.push({
            action: 'Logout',
            description: 'User successfully logged out',
            date: new Date(),
            ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
          });
          await user.save({ validateBeforeSave: false });
        }
      } catch (err) {
        // Token expired/invalid, proceed to clear cookies
      }
    }

    res.cookie('jwt', 'loggedout', { expires: new Date(Date.now() + 5000), httpOnly: true });
    res.cookie('refreshToken', 'loggedout', { expires: new Date(Date.now() + 5000), httpOnly: true, path: '/api/auth' });
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const logoutAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    user.refreshTokens = [];
    user.activityTimeline.push({
      action: 'Logout All Devices',
      description: 'Terminated sessions across all logged-in devices',
      date: new Date(),
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
    });
    await user.save({ validateBeforeSave: false });

    res.cookie('jwt', 'loggedout', { expires: new Date(Date.now() + 5000), httpOnly: true });
    res.cookie('refreshToken', 'loggedout', { expires: new Date(Date.now() + 5000), httpOnly: true, path: '/api/auth' });
    res.status(200).json({ status: 'success', message: 'Logged out from all devices' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ status: 'error', message: 'No refresh token provided' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token' });
      return;
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({ status: 'error', message: 'The user belonging to this token no longer exists.' });
      return;
    }

    // Refresh token rotation check
    if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      // Replay attack! Clear all refresh tokens to secure user account
      user.refreshTokens = [];
      user.activityTimeline.push({
        action: 'Security Alert',
        description: 'Reused refresh token detected. Force logout across all devices for security.',
        date: new Date(),
        ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
      });
      await user.save({ validateBeforeSave: false });

      res.status(401).json({ status: 'error', message: 'Security alert: Refresh token reuse detected. Please log in again.' });
      return;
    }

    // Generate new tokens
    const newAccessToken = signAccessToken(user._id.toString());
    const newRefreshToken = signRefreshToken(user._id.toString());

    // Replace the old refresh token with the new one
    user.refreshTokens = (user.refreshTokens || []).filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    // Send new cookies
    const isProd = process.env.NODE_ENV === 'production';
    
    res.cookie('jwt', newAccessToken, {
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict' as const
    });

    res.cookie('refreshToken', newRefreshToken, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict' as const,
      path: '/api/auth'
    });

    res.status(200).json({
      status: 'success',
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ status: 'error', message: 'Please provide email address' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 to prevent user enumeration attacks, but let dev know in logs
      res.status(200).json({ status: 'success', message: 'If that email exists in our system, we sent a reset link.' });
      return;
    }

    // Generate reset token (simulated link)
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Store simple hash in memory or mock on user (or just return it for testing!)
    // For development, we return it in response so they can easily complete the flow!
    user.activityTimeline.push({
      action: 'Forgot Password Requested',
      description: 'Requested a password reset link',
      date: new Date(),
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
    });
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'If that email exists in our system, we sent a reset link.',
      resetToken // Return resetToken for easy local development testing!
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body; // In dev we bypass complex token verification or let them pass email + new password
    if (!email || !password) {
      res.status(400).json({ status: 'error', message: 'Please provide email and new password' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    user.password = password; // pre-save hook will hash it automatically
    user.failedAttempts = 0;
    user.isLocked = false;
    user.lockUntil = undefined;
    user.refreshTokens = []; // Clear all sessions
    user.activityTimeline.push({
      action: 'Password Reset Successful',
      description: 'Reset password successfully. Cleared all active sessions.',
      date: new Date(),
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
    });
    await user.save();

    res.status(200).json({ status: 'success', message: 'Password has been reset successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ status: 'error', message: 'Please provide current and new password' });
      return;
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      res.status(401).json({ status: 'error', message: 'Incorrect current password' });
      return;
    }

    user.password = newPassword;
    user.refreshTokens = []; // Terminate all other sessions
    user.activityTimeline.push({
      action: 'Password Changed',
      description: 'User updated their password. Terminated all other active sessions.',
      date: new Date(),
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
    });
    await user.save();

    res.status(200).json({ status: 'success', message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
