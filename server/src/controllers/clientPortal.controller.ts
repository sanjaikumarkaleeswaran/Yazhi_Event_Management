import { NextFunction, Response } from 'express';
import { z } from 'zod';
import ClientDocument from '../models/ClientDocument';
import Booking from '../models/Booking';
import Communication from '../models/Communication';
import Notification from '../models/Notification';
import TeamMember from '../models/TeamMember';
import Vendor from '../models/Vendor';
import User from '../models/User';
import cloudinary from '../utils/cloudinary';
import { deliverCommunication } from '../utils/communicationService';
import { ClientRequest } from '../middleware/clientMiddleware';

const bookingFilter = (clientId: string, email: string) => ({ $or: [{ clientId }, { email: email.toLowerCase() }] });
const safeTeam = (member: any) => ({ id: member._id, name: `${member.firstName} ${member.lastName}`, role: member.designation, photo: member.photo || '' });
const safeVendor = (vendor: any) => ({ id: vendor._id, name: vendor.businessName, category: vendor.category, contact: vendor.primaryContact });
const safeBooking = (booking: any) => ({
  id: booking._id, bookingNumber: booking.bookingNumber, eventType: booking.eventType, eventDate: booking.eventDate,
  venue: booking.venue || '', packageName: booking.packageName || '', guestCount: booking.guestCount || 0,
  eventBudget: booking.eventBudget, amount: booking.amount, advancePaid: booking.advancePaid || 0,
  status: booking.status, paymentStatus: booking.paymentStatus, createdAt: booking.createdAt, updatedAt: booking.updatedAt,
  team: (booking.assignedTeam || []).map(safeTeam), vendors: (booking.assignedVendors || []).map(safeVendor),
  timeline: (booking.timeline || []).filter((item: any) => !/internal|admin|audit|private/i.test(`${item.action} ${item.description}`)),
});

const findBookings = (req: ClientRequest) => Booking.find(bookingFilter(req.client._id.toString(), req.client.email))
  .populate('assignedTeam', 'firstName lastName designation photo')
  .populate('assignedVendors', 'businessName category primaryContact')
  .lean();

export const getDashboard = async (req: ClientRequest, res: Response, next: NextFunction) => {
  try {
    const [rawBookings, unreadNotifications] = await Promise.all([
      findBookings(req),
      Notification.countDocuments({ recipientId: req.user!._id, isRead: false }),
    ]);
    const bookings = rawBookings.map(safeBooking);
    const upcoming = bookings.filter((booking: any) => new Date(booking.eventDate) >= new Date() && booking.status !== 'Cancelled').sort((a: any, b: any) => +new Date(a.eventDate) - +new Date(b.eventDate));
    res.json({ status: 'success', data: {
      stats: { upcomingEvents: upcoming.length, activeBookings: bookings.filter((b: any) => ['Pending', 'Confirmed', 'Rescheduled'].includes(b.status)).length, completedEvents: bookings.filter((b: any) => b.status === 'Completed').length, unreadNotifications },
      nextEvent: upcoming[0] || null,
      recentActivity: bookings.flatMap((booking: any) => booking.timeline.map((item: any) => ({ ...item, bookingNumber: booking.bookingNumber, eventType: booking.eventType }))).sort((a: any, b: any) => +new Date(b.date) - +new Date(a.date)).slice(0, 10),
    }});
  } catch (error) { next(error); }
};

export const getBookings = async (req: ClientRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const query: any = bookingFilter(req.client._id.toString(), req.client.email);
    if (req.query.status && req.query.status !== 'All') query.status = req.query.status;
    if (req.query.search) { const search = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); query.$and = [{ $or: [{ bookingNumber: search }, { eventType: search }, { venue: search }] }]; }
    const sort = req.query.order === 'asc' ? 1 : -1;
    const [items, total] = await Promise.all([Booking.find(query).populate('assignedTeam', 'firstName lastName designation photo').populate('assignedVendors', 'businessName category primaryContact').sort({ [String(req.query.sort || 'eventDate')]: sort }).skip((page - 1) * limit).limit(limit).lean(), Booking.countDocuments(query)]);
    res.json({ status: 'success', data: items.map(safeBooking), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const getBooking = async (req: ClientRequest, res: Response, next: NextFunction) => {
  try { const booking = await Booking.findOne({ _id: req.params.id, ...bookingFilter(req.client._id.toString(), req.client.email) }).populate('assignedTeam', 'firstName lastName designation photo').populate('assignedVendors', 'businessName category primaryContact').lean(); if (!booking) { res.status(404).json({ status: 'error', message: 'Booking not found' }); return; } res.json({ status: 'success', data: safeBooking(booking) }); } catch (error) { next(error); }
};

export const getCalendar = async (req: ClientRequest, res: Response, next: NextFunction) => {
  try { const bookings = await findBookings(req); res.json({ status: 'success', data: bookings.map((booking: any) => ({ id: booking._id, title: booking.eventType, start: booking.eventDate, venue: booking.venue || '', status: booking.status, bookingNumber: booking.bookingNumber })) }); } catch (error) { next(error); }
};

export const getDocuments = async (req: ClientRequest, res: Response, next: NextFunction) => {
  try { const bookings = await Booking.find(bookingFilter(req.client._id.toString(), req.client.email)).select('_id').lean(); const ids = bookings.map((booking) => booking._id); const documents = await ClientDocument.find({ clientId: req.client._id, bookingId: { $in: ids } }).sort({ createdAt: -1 }).lean(); res.json({ status: 'success', data: documents }); } catch (error) { next(error); }
};

export const uploadDocument = async (req: ClientRequest, res: Response, next: NextFunction) => {
  try {
    const file = (req as any).file; const bookingId = String(req.body.bookingId || '');
    if (!file || !bookingId) { res.status(400).json({ status: 'error', message: 'A file and booking are required' }); return; }
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype) || file.size > 10 * 1024 * 1024) { res.status(400).json({ status: 'error', message: 'Unsupported or oversized file' }); return; }
    const booking = await Booking.findOne({ _id: bookingId, ...bookingFilter(req.client._id.toString(), req.client.email) }).select('_id').lean();
    if (!booking) { res.status(404).json({ status: 'error', message: 'Booking not found' }); return; }
    const encoded = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(encoded, { folder: `yazhi-events/clients/${req.client._id}`, resource_type: 'auto', use_filename: true, unique_filename: true });
    const document = await ClientDocument.create({ filename: file.originalname, url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type, size: file.size, uploadedBy: req.user!._id, clientId: req.client._id, bookingId: booking._id, documentType: req.body.documentType || 'Other' });
    res.status(201).json({ status: 'success', data: document });
  } catch (error) { next(error); }
};

export const deleteDocument = async (req: ClientRequest, res: Response, next: NextFunction) => {
  try { const document = await ClientDocument.findOneAndDelete({ _id: req.params.id, clientId: req.client._id, uploadedBy: req.user!._id }); if (!document) { res.status(404).json({ status: 'error', message: 'Document not found or cannot be deleted' }); return; } await cloudinary.uploader.destroy(document.publicId, { resource_type: document.resourceType }); res.json({ status: 'success', data: null }); } catch (error) { next(error); }
};

const notificationQuery = (userId: string) => ({ $or: [{ recipientId: userId }, { recipientType: 'All' }] });
export const getNotifications = async (req: ClientRequest, res: Response, next: NextFunction) => { try { const query: any = notificationQuery(req.user!._id.toString()); if (req.query.isRead !== undefined) query.isRead = req.query.isRead === 'true'; const [notifications, total] = await Promise.all([Notification.find(query).sort({ createdAt: -1 }).skip((Number(req.query.page || 1) - 1) * 20).limit(20).lean(), Notification.countDocuments(query)]); res.json({ status: 'success', data: notifications, meta: { total } }); } catch (error) { next(error); } };
export const updateNotification = async (req: ClientRequest, res: Response, next: NextFunction) => { try { const notification = await Notification.findOneAndUpdate({ _id: req.params.id, ...notificationQuery(req.user!._id.toString()) } as any, { $set: { isRead: true, readAt: new Date() } }, { new: true }).lean(); if (!notification) { res.status(404).json({ status: 'error', message: 'Notification not found' }); return; } res.json({ status: 'success', data: notification }); } catch (error) { next(error); } };
export const updateAllNotifications = async (req: ClientRequest, res: Response, next: NextFunction) => { try { await Notification.updateMany({ ...notificationQuery(req.user!._id.toString()), isRead: false } as any, { $set: { isRead: true, readAt: new Date() } }); res.json({ status: 'success' }); } catch (error) { next(error); } };

export const getMessages = async (req: ClientRequest, res: Response, next: NextFunction) => { try { const messages = await Communication.find({ clientId: req.client._id }).select('type subject message status createdAt sentAt bookingId').sort({ createdAt: -1 }).lean(); res.json({ status: 'success', data: messages }); } catch (error) { next(error); } };
export const sendMessage = async (req: ClientRequest, res: Response, next: NextFunction) => { try { const payload = z.object({ subject: z.string().trim().min(1).max(160), message: z.string().trim().min(1).max(5000), bookingId: z.string().optional() }).parse(req.body); let booking: any; if (payload.bookingId) booking = await Booking.findOne({ _id: payload.bookingId, ...bookingFilter(req.client._id.toString(), req.client.email) }).lean(); if (payload.bookingId && !booking) { res.status(404).json({ status: 'error', message: 'Booking not found' }); return; } const message = await deliverCommunication({ type: 'Email', recipientName: 'Yazhi Events Team', recipientEmail: process.env.BUSINESS_EMAIL || 'hello@yazhievents.com', subject: payload.subject, message: payload.message, clientId: req.client._id.toString(), bookingId: booking?._id.toString(), sentBy: req.user!._id.toString() }); res.status(201).json({ status: 'success', data: message }); } catch (error) { next(error); } };

export const getProfile = async (req: ClientRequest, res: Response) => { res.json({ status: 'success', data: { client: req.client, user: { name: req.user!.name, email: req.user!.email, phone: req.user!.phone, photo: req.user!.photo, createdAt: req.user!.createdAt, lastLogin: req.user!.lastLogin }, settings: req.user!.clientPreferences } }); };
export const updateProfile = async (req: ClientRequest, res: Response, next: NextFunction) => { try { const payload = z.object({ name: z.string().trim().min(2), email: z.string().email(), phone: z.string().trim().min(5), address: z.string().max(300).optional(), profilePhoto: z.string().url().optional() }).parse(req.body); const [firstName, ...rest] = payload.name.split(' '); await User.findByIdAndUpdate(req.user!._id, { firstName, lastName: rest.join(' ') || firstName, email: payload.email, phone: payload.phone, photo: payload.profilePhoto }); const client = await req.client.updateOne({ $set: { name: payload.name, email: payload.email, phone: payload.phone, address: payload.address, profilePhoto: payload.profilePhoto } }); res.json({ status: 'success', data: client }); } catch (error) { next(error); } };
export const getSettings = async (req: ClientRequest, res: Response) => { res.json({ status: 'success', data: req.user!.clientPreferences || {} }); };
export const updateSettings = async (req: ClientRequest, res: Response, next: NextFunction) => { try { const preferences = z.object({ emailNotifications: z.boolean(), whatsappNotifications: z.boolean(), smsNotifications: z.boolean(), eventReminders: z.boolean(), marketingCommunications: z.boolean() }).parse(req.body); await User.findByIdAndUpdate(req.user!._id, { $set: { clientPreferences: preferences } }); res.json({ status: 'success', data: preferences }); } catch (error) { next(error); } };