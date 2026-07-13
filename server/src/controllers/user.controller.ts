import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { 
  dispatchUserCreated, 
  dispatchRoleChanged 
} from '../utils/notificationDispatcher';

export const getDefaultPermissionsForRole = (role: string) => {
  const defaultActions = {
    view: false,
    create: false,
    edit: false,
    delete: false,
    export: false,
    approve: false,
    assign: false,
  };

  const modules = [
    'Dashboard', 'Bookings', 'Calendar', 'Inquiries', 'Clients', 
    'Vendors', 'Team', 'Payments', 'Reports', 'Settings', 
    'Blog', 'Notifications', 'Users'
  ];

  const permissions = new Map<string, any>();
  for (const mod of modules) {
    permissions.set(mod, { ...defaultActions });
  }

  if (role === 'Super Admin' || role === 'Admin') {
    for (const mod of modules) {
      permissions.set(mod, {
        view: true,
        create: true,
        edit: true,
        delete: true,
        export: true,
        approve: true,
        assign: true,
      });
    }
  } else if (role === 'Manager') {
    for (const mod of modules) {
      if (mod === 'Settings' || mod === 'Users') {
        permissions.set(mod, { ...defaultActions, view: true });
      } else {
        permissions.set(mod, {
          view: true,
          create: true,
          edit: true,
          delete: mod !== 'Payments',
          export: true,
          approve: true,
          assign: true,
        });
      }
    }
  } else if (role === 'Coordinator') {
    permissions.set('Dashboard', { ...defaultActions, view: true });
    permissions.set('Bookings', { ...defaultActions, view: true, create: true, edit: true, assign: true });
    permissions.set('Calendar', { ...defaultActions, view: true });
    permissions.set('Inquiries', { ...defaultActions, view: true, create: true, edit: true });
    permissions.set('Clients', { ...defaultActions, view: true, create: true });
    permissions.set('Vendors', { ...defaultActions, view: true });
  } else if (role === 'Employee') {
    permissions.set('Dashboard', { ...defaultActions, view: true });
    permissions.set('Calendar', { ...defaultActions, view: true });
    permissions.set('Team', { ...defaultActions, view: true });
  } else if (role === 'Vendor') {
    permissions.set('Dashboard', { ...defaultActions, view: true });
    permissions.set('Bookings', { ...defaultActions, view: true });
  } else if (role === 'Client') {
    permissions.set('Dashboard', { ...defaultActions, view: true });
    permissions.set('Bookings', { ...defaultActions, view: true });
  }

  return permissions;
};

// GET /api/users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, status, search, page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/users/:id
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/users
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ status: 'error', message: 'User with this email already exists' });
      return;
    }

    const permissions = getDefaultPermissionsForRole(role);

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      permissions,
      status: 'Active',
      activityTimeline: [
        {
          action: 'User Created',
          description: `User account created by admin (${req.user?.firstName} ${req.user?.lastName})`,
          date: new Date(),
          ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
        }
      ]
    });

    await user.save();
    user.password = undefined;

    await dispatchUserCreated(user, req.user);

    res.status(201).json({ status: 'success', data: { user } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// PATCH /api/users/:id
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone, password, photo } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (photo !== undefined) user.photo = photo;
    if (password) {
      user.password = password;
      user.refreshTokens = []; // Clear active sessions on password change
    }

    user.activityTimeline.push({
      action: 'Profile Updated',
      description: `Profile fields modified by admin (${req.user?.firstName} ${req.user?.lastName})`,
      date: new Date(),
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
    });

    await user.save();
    user.password = undefined;

    res.status(200).json({ status: 'success', data: { user } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// PATCH /api/users/:id/status
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      res.status(400).json({ status: 'error', message: 'Invalid status value' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    const oldStatus = user.status;
    user.status = status;
    if (status !== 'Active') {
      user.refreshTokens = []; // Log out deactivated/suspended user
    }

    user.activityTimeline.push({
      action: 'Status Changed',
      description: `Account status updated from ${oldStatus} to ${status} by admin`,
      date: new Date(),
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
    });

    await user.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'success', data: { user } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// PATCH /api/users/:id/role
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    const roles = ['Super Admin', 'Admin', 'Manager', 'Coordinator', 'Employee', 'Vendor', 'Client'];
    if (!roles.includes(role)) {
      res.status(400).json({ status: 'error', message: 'Invalid role value' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    const oldRole = user.role;
    user.role = role as any;
    
    // Auto-update permissions to match new role
    const newPermissions = getDefaultPermissionsForRole(role);
    user.permissions = newPermissions;

    user.activityTimeline.push({
      action: 'Role Changed',
      description: `Role changed from ${oldRole} to ${role} by admin. Permissions reset to default for role.`,
      date: new Date(),
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
    });

    await user.save({ validateBeforeSave: false });

    await dispatchRoleChanged(user, oldRole, role);

    res.status(200).json({ status: 'success', data: { user } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// PATCH /api/users/:id/permissions
export const updateUserPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { permissions } = req.body; // Expecting Map or Object representing the matrix
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    user.permissions = permissions;
    user.activityTimeline.push({
      action: 'Permissions Updated',
      description: `Custom permissions matrix modified by admin`,
      date: new Date(),
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
    });

    await user.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'success', data: { user } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/users/bulk-status
export const bulkUpdateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ids, status } = req.body;
    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      res.status(400).json({ status: 'error', message: 'Invalid status' });
      return;
    }

    await User.updateMany(
      { _id: { $in: ids } },
      { 
        $set: { status },
        $push: {
          activityTimeline: {
            action: 'Bulk Status Update',
            description: `Status bulk-updated to ${status} by admin`,
            date: new Date(),
            ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
          }
        }
      }
    );

    // Force log out deactivated users
    if (status !== 'Active') {
      await User.updateMany({ _id: { $in: ids } }, { $set: { refreshTokens: [] } });
    }

    res.status(200).json({ status: 'success', message: `Bulk updated status to ${status}` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/users/bulk-delete
export const bulkDeleteUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    await User.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ status: 'success', message: 'Bulk deleted users successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
