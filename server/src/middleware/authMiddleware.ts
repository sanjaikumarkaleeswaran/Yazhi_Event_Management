import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ status: 'error', message: 'Not authorized to access this route' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({ status: 'error', message: 'The user belonging to this token no longer exists.' });
      return;
    }

    if (user.status !== 'Active') {
      res.status(403).json({ status: 'error', message: `Your account is currently ${user.status}` });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Not authorized to access this route' });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ status: 'error', message: 'You do not have permission to perform this action' });
      return;
    }
    next();
  };
};

export const hasPermission = (moduleName: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve' | 'assign') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }
    
    // Super Admin is bypassed
    if (req.user.role === 'Super Admin') {
      return next();
    }

    // Admins have all permissions by default except perhaps if explicitly turned off, but typically admin has all permissions
    if (req.user.role === 'Admin') {
      return next();
    }

    const userPermissions = req.user.permissions;
    let hasPerm = false;

    if (userPermissions instanceof Map) {
      const modulePerms = userPermissions.get(moduleName);
      if (modulePerms && modulePerms[action] === true) {
        hasPerm = true;
      }
    } else if (userPermissions && typeof userPermissions === 'object') {
      const modulePerms = (userPermissions as any)[moduleName];
      if (modulePerms && modulePerms[action] === true) {
        hasPerm = true;
      }
    }

    if (hasPerm) {
      return next();
    }

    res.status(403).json({
      status: 'error',
      message: `Access denied. You do not have permission to ${action} ${moduleName}.`
    });
  };
};
