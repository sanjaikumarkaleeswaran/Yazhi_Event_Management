import { Request, Response, NextFunction } from 'express';
import Setting, { ISetting } from '../models/Setting';
import AuditLog from '../models/AuditLog';
import { settingsUpdateSchema, sanitizeSettingsPayload } from '../validators/settings.validator';
import { AuthRequest } from '../middleware/authMiddleware';

const getDefaultSettings = (): Partial<ISetting> => ({
  companyName: 'Yazhi Event Management',
  businessEmail: 'hello@yazhievents.com',
  businessPhone: '+91 9876543210',
  website: 'https://yazhievents.com',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  language: 'en',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  enableMaintenanceMode: false,
  bookingPrefix: 'YAZHI',
  defaultBookingDuration: 240,
  workingHours: '09:00-18:00',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  maximumBookingsPerDay: 10,
  bufferTime: 30,
  depositPercentage: 30,
  taxPercentage: 5,
  lateFee: 0,
  enableOnlinePayment: true,
  enableCashPayment: true,
  enableBankTransfer: true,
  smtpHost: '',
  smtpPort: 587,
  fromEmail: 'hello@yazhievents.com',
  fromName: 'Yazhi Events',
  enableEmailNotifications: true,
  enableWhatsApp: false,
  dryRunMode: true,
  uploadFolder: 'yazhi-events',
  maxUploadSize: 10000,
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'webp'],
  enableImageCompression: true,
  primaryColor: '#C89B3C',
  secondaryColor: '#5A1E1E',
  accentColor: '#F6E8C7',
  sidebarStyle: 'glass',
  darkMode: true,
  lightMode: true,
  fontSelection: 'Inter',
  borderRadius: 16,
  animationsEnabled: true,
  jwtExpiry: 86400,
  refreshTokenExpiry: 2592000,
  sessionTimeout: 1800,
  passwordLength: 8,
  passwordComplexity: 'medium',
  maxLoginAttempts: 5,
  accountLockDuration: 900,
  enableTwoFactorAuthentication: false,
  enableAuditLogs: true,
  enableIpLogging: true,
});

const ensureSettingsDocument = async () => {
  const existing = await Setting.findOne({});
  if (existing) {
    return existing;
  }
  return await Setting.create(getDefaultSettings());
};

const createAuditEntry = async (req: AuthRequest, action: string, oldValue: any, newValue: any) => {
  await AuditLog.create({
    userId: req.user?._id?.toString() || 'system',
    userName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'system',
    module: 'Settings',
    action,
    oldValue,
    newValue,
    ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
    browser: req.headers['user-agent'] || 'Unknown',
    operatingSystem: 'Unknown',
  });
};

export const getSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await ensureSettingsDocument();
    res.status(200).json({ status: 'success', data: { settings } });
  } catch (error: any) {
    next(error);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = sanitizeSettingsPayload(req.body);
    const parsed = settingsUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      res.status(400).json({ status: 'error', message: 'Invalid settings payload', errors: parsed.error.flatten() });
      return;
    }

    const settings = await ensureSettingsDocument();
    const oldValue = settings.toObject();
    Object.assign(settings, parsed.data);
    await settings.save();
    await createAuditEntry(req, 'Updated settings', oldValue, settings.toObject());

    res.status(200).json({ status: 'success', message: 'Settings updated successfully', data: { settings } });
  } catch (error: any) {
    next(error);
  }
};

export const patchSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = sanitizeSettingsPayload(req.body);
    const parsed = settingsUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      res.status(400).json({ status: 'error', message: 'Invalid settings payload', errors: parsed.error.flatten() });
      return;
    }

    const settings = await ensureSettingsDocument();
    const oldValue = settings.toObject();
    Object.assign(settings, parsed.data);
    await settings.save();
    await createAuditEntry(req, 'Patched settings', oldValue, settings.toObject());

    res.status(200).json({ status: 'success', message: 'Settings updated successfully', data: { settings } });
  } catch (error: any) {
    next(error);
  }
};

export const testEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await ensureSettingsDocument();
    res.status(200).json({ status: 'success', message: 'Email test endpoint ready', data: { settings: { fromEmail: settings.fromEmail, smtpHost: settings.smtpHost } } });
  } catch (error: any) {
    next(error);
  }
};

export const createBackup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await ensureSettingsDocument();
    res.status(200).json({ status: 'success', message: 'Backup created successfully', data: { backup: { settings, createdAt: new Date() } } });
  } catch (error: any) {
    next(error);
  }
};

export const restoreSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await ensureSettingsDocument();
    res.status(200).json({ status: 'success', message: 'Settings restore endpoint ready', data: { settings } });
  } catch (error: any) {
    next(error);
  }
};
