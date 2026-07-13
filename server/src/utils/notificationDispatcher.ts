import Notification from '../models/Notification';
import User from '../models/User';

export const createNotification = async (data: {
  title: string;
  message: string;
  type: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  recipientType: 'Super Admin' | 'Admin' | 'Manager' | 'Coordinator' | 'Employee' | 'Vendor' | 'Client' | 'All';
  recipientId?: string;
  senderId?: string;
  module: 'Dashboard' | 'Bookings' | 'Calendar' | 'Inquiries' | 'Clients' | 'Vendors' | 'Team' | 'Payments' | 'Reports' | 'Settings' | 'Blog' | 'Notifications' | 'Users';
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, string>;
}) => {
  try {
    const notif = new Notification({
      ...data,
      priority: data.priority || 'Medium',
      isRead: false,
      deliveryStatus: 'Sent',
      channels: ['In-App'],
      scheduledAt: new Date()
    });
    await notif.save();
    return notif;
  } catch (error) {
    console.error('❌ Notification dispatch failed:', error);
  }
};

// Dispatch helpers for automatic events

export const dispatchBookingCreated = async (booking: any) => {
  // Notify Admins, Managers and Coordinators
  const rolesToNotify = ['Super Admin', 'Admin', 'Manager', 'Coordinator'] as const;
  for (const role of rolesToNotify) {
    await createNotification({
      title: 'New Booking Created',
      message: `A new booking "${booking.eventName || booking.title}" has been registered for ₹${booking.totalAmount || booking.budget || 0}.`,
      type: 'Booking',
      priority: 'High',
      recipientType: role,
      module: 'Bookings',
      referenceId: booking._id,
      referenceType: 'Booking'
    });
  }

  // Notify the Client specifically if client exists
  if (booking.clientId) {
    await createNotification({
      title: 'Booking Registration Confirmed',
      message: `Your booking "${booking.eventName || booking.title}" has been successfully initiated.`,
      type: 'Booking',
      priority: 'Medium',
      recipientType: 'Client',
      recipientId: booking.clientId,
      module: 'Bookings',
      referenceId: booking._id,
      referenceType: 'Booking'
    });
  }
};

export const dispatchBookingUpdated = async (booking: any) => {
  const rolesToNotify = ['Super Admin', 'Admin', 'Manager', 'Coordinator'] as const;
  for (const role of rolesToNotify) {
    await createNotification({
      title: 'Booking Details Updated',
      message: `Booking "${booking.eventName || booking.title}" details have been updated.`,
      type: 'Booking',
      priority: 'Medium',
      recipientType: role,
      module: 'Bookings',
      referenceId: booking._id,
      referenceType: 'Booking'
    });
  }
};

export const dispatchBookingCancelled = async (booking: any) => {
  const rolesToNotify = ['Super Admin', 'Admin', 'Manager'] as const;
  for (const role of rolesToNotify) {
    await createNotification({
      title: 'Booking Cancelled ⚠️',
      message: `Booking "${booking.eventName || booking.title}" has been cancelled.`,
      type: 'Booking',
      priority: 'Critical',
      recipientType: role,
      module: 'Bookings',
      referenceId: booking._id,
      referenceType: 'Booking'
    });
  }
};

export const dispatchInquiryCreated = async (inquiry: any) => {
  const rolesToNotify = ['Super Admin', 'Admin', 'Manager', 'Coordinator'] as const;
  for (const role of rolesToNotify) {
    await createNotification({
      title: 'New CRM Inquiry Received',
      message: `Inquiry from ${inquiry.customerName || inquiry.name} regarding "${inquiry.eventType || 'Event'}" event.`,
      type: 'Inquiry',
      priority: 'Medium',
      recipientType: role,
      module: 'Inquiries',
      referenceId: inquiry._id,
      referenceType: 'Inquiry'
    });
  }
};

export const dispatchInquiryConverted = async (inquiry: any) => {
  const rolesToNotify = ['Super Admin', 'Admin', 'Manager'] as const;
  for (const role of rolesToNotify) {
    await createNotification({
      title: 'Inquiry Converted successfully 🎉',
      message: `Lead ${inquiry.customerName || inquiry.name} has been successfully converted into a booking.`,
      type: 'Inquiry',
      priority: 'High',
      recipientType: role,
      module: 'Inquiries',
      referenceId: inquiry._id,
      referenceType: 'Inquiry'
    });
  }
};

export const dispatchTeamAssigned = async (booking: any, employee: any) => {
  // Notify the assigned employee
  await createNotification({
    title: 'New Event Assigned 📅',
    message: `You have been assigned as team member for event "${booking.eventName || booking.title}".`,
    type: 'Team',
    priority: 'High',
    recipientType: 'Employee',
    recipientId: employee._id, // if employee matches a User account
    module: 'Team',
    referenceId: booking._id,
    referenceType: 'Booking'
  });

  // Notify Admins
  const rolesToNotify = ['Super Admin', 'Admin', 'Manager'] as const;
  for (const role of rolesToNotify) {
    await createNotification({
      title: 'Team Member Assigned',
      message: `Staff member ${employee.firstName} ${employee.lastName} has been assigned to "${booking.eventName || booking.title}".`,
      type: 'Team',
      priority: 'Low',
      recipientType: role,
      module: 'Team',
      referenceId: booking._id,
      referenceType: 'Booking'
    });
  }
};

export const dispatchVendorAssigned = async (booking: any, vendor: any) => {
  // Notify the Vendor if they have a User account
  if (vendor.userId || vendor._id) {
    await createNotification({
      title: 'New Vendor Booking Assignment',
      message: `You have been booked as vendor for event "${booking.eventName || booking.title}".`,
      type: 'Vendor',
      priority: 'High',
      recipientType: 'Vendor',
      recipientId: vendor.userId || vendor._id,
      module: 'Vendors',
      referenceId: booking._id,
      referenceType: 'Booking'
    });
  }

  // Notify Admins
  const rolesToNotify = ['Super Admin', 'Admin', 'Manager'] as const;
  for (const role of rolesToNotify) {
    await createNotification({
      title: 'Vendor Assigned to Event',
      message: `Vendor ${vendor.name || vendor.companyName} has been assigned to "${booking.eventName || booking.title}".`,
      type: 'Vendor',
      priority: 'Low',
      recipientType: role,
      module: 'Vendors',
      referenceId: booking._id,
      referenceType: 'Booking'
    });
  }
};

export const dispatchUserCreated = async (newUser: any, creator: any) => {
  await createNotification({
    title: 'New User Onboarded',
    message: `User account created for ${newUser.firstName} ${newUser.lastName} (${newUser.role}) by ${creator?.firstName || 'System'}.`,
    type: 'User',
    priority: 'Medium',
    recipientType: 'Super Admin',
    module: 'Users',
    referenceId: newUser._id,
    referenceType: 'User'
  });
};

export const dispatchUserLogin = async (user: any, ip: string) => {
  // Dispatch notification for suspicious logins or just general logins
  await createNotification({
    title: 'Security Session Alert',
    message: `Account session login detected from IP ${ip}.`,
    type: 'System',
    priority: 'Low',
    recipientType: 'Super Admin',
    recipientId: user._id,
    module: 'Users',
    referenceId: user._id,
    referenceType: 'User'
  });
};

export const dispatchRoleChanged = async (user: any, oldRole: string, newRole: string) => {
  // Notify user
  await createNotification({
    title: 'Security Profile Updated ⚠️',
    message: `Your account role was updated from ${oldRole} to ${newRole}.`,
    type: 'Warning',
    priority: 'Critical',
    recipientType: user.role, // Target role or direct ID
    recipientId: user._id,
    module: 'Users',
    referenceId: user._id,
    referenceType: 'User'
  });
};

export const dispatchClientAdded = async (client: any) => {
  const rolesToNotify = ['Super Admin', 'Admin', 'Manager'] as const;
  for (const role of rolesToNotify) {
    await createNotification({
      title: 'New Client Registered',
      message: `Client ${client.name || client.firstName} was added to the database.`,
      type: 'Client',
      priority: 'Low',
      recipientType: role,
      module: 'Clients',
      referenceId: client._id,
      referenceType: 'Client'
    });
  }
};

export const dispatchReportGenerated = async (reportType: string, format: string) => {
  const rolesToNotify = ['Super Admin', 'Admin', 'Manager'] as const;
  for (const role of rolesToNotify) {
    await createNotification({
      title: 'Analytical Report Compiled',
      message: `${reportType} report has been compiled and exported as ${format}.`,
      type: 'Reports',
      priority: 'Low',
      recipientType: role,
      module: 'Reports'
    });
  }
};

export const dispatchCalendarConflict = async (booking: any, conflictDetails: string) => {
  const rolesToNotify = ['Super Admin', 'Admin', 'Manager', 'Coordinator'] as const;
  for (const role of rolesToNotify) {
    await createNotification({
      title: 'Scheduling Conflict Warning ⚡',
      message: `Conflict detected for "${booking.eventName || booking.title}": ${conflictDetails}`,
      type: 'Calendar',
      priority: 'High',
      recipientType: role,
      module: 'Calendar',
      referenceId: booking._id,
      referenceType: 'Booking'
    });
  }
};
