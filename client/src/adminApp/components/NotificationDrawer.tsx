import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Bell, Check, Trash2, MessageSquare,
  Users, Truck, Zap, Shield, FileText, ShoppingBag,
  Inbox, Loader2, Search
} from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useClearAllNotifications
} from '../../shared/hooks/useNotifications';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'Booking Created':
    case 'Booking Updated':
    case 'Booking Cancelled':
      return <ShoppingBag size={16} className="text-emerald-500" />;
    case 'Team Assigned':
      return <Users size={16} className="text-blue-500" />;
    case 'Vendor Assigned':
      return <Truck size={16} className="text-violet-500" />;
    case 'Inquiry Created':
    case 'Inquiry Converted':
      return <MessageSquare size={16} className="text-amber-500" />;
    case 'Security Warning':
    case 'User Login':
    case 'Role Changed':
    case 'User Created':
      return <Shield size={16} className="text-red-500" />;
    case 'Announcement':
      return <Bell size={16} className="text-indigo-500" />;
    case 'Report Generated':
      return <FileText size={16} className="text-pink-500" />;
    default:
      return <Zap size={16} className="text-gray-500" />;
  }
};

const getPriorityBadgeColor = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'High':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Medium':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [readFilter, setReadFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);

  const filters = {
    page,
    limit: 20,
    search: search || undefined,
    type: typeFilter || undefined,
    priority: priorityFilter || undefined,
    isRead: readFilter,
  };

  const { data: responseData, isLoading } = useNotifications(filters);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();
  const clearAllMutation = useClearAllNotifications();

  const notifications = responseData?.data?.notifications || [];
  const pagination = responseData?.data?.pagination || { page: 1, pages: 1, total: 0 };

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all your notifications?')) {
      clearAllMutation.mutate();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-[#C89B3C]" />
                <h2 className="text-lg font-bold text-gray-900">Notification Center</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filters Section */}
            <div className="p-4 border-b border-gray-100 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/35 focus:border-[#C89B3C] transition-all"
                />
              </div>

              {/* Advanced Filter Selects */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <select
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                  >
                    <option value="">All Types</option>
                    <option value="Booking Created">Booking Created</option>
                    <option value="Booking Updated">Booking Updated</option>
                    <option value="Booking Cancelled">Booking Cancelled</option>
                    <option value="Team Assigned">Team Assigned</option>
                    <option value="Vendor Assigned">Vendor Assigned</option>
                    <option value="Inquiry Created">Inquiry Created</option>
                    <option value="Inquiry Converted">Inquiry Converted</option>
                    <option value="Security Warning">Security Warning</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Report Generated">Report Generated</option>
                  </select>
                </div>

                <div>
                  <select
                    value={priorityFilter}
                    onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                  >
                    <option value="">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <select
                    value={readFilter === undefined ? '' : String(readFilter)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReadFilter(val === '' ? undefined : val === 'true');
                      setPage(1);
                    }}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                  >
                    <option value="">All Statuses</option>
                    <option value="false">Unread</option>
                    <option value="true">Read</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center text-xs pt-1">
                <button
                  onClick={handleMarkAllRead}
                  disabled={notifications.length === 0}
                  className="flex items-center gap-1.5 text-[#C89B3C] font-semibold hover:underline disabled:opacity-50"
                >
                  <Check size={14} /> Mark all read
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={notifications.length === 0}
                  className="flex items-center gap-1.5 text-red-600 font-semibold hover:underline disabled:opacity-50"
                >
                  <Trash2 size={14} /> Clear all
                </button>
              </div>
            </div>

            {/* Notifications Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
                  <Loader2 size={24} className="animate-spin text-[#C89B3C]" />
                  <span className="text-xs">Fetching alerts...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                  <div className="p-3 bg-gray-50 rounded-full">
                    <Inbox size={32} className="text-gray-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">No alerts found</p>
                    <p className="text-xs text-gray-400 mt-1">You are all caught up!</p>
                  </div>
                </div>
              ) : (
                notifications.map((n: any) => (
                  <motion.div
                    key={n._id}
                    layoutId={n._id}
                    className={`p-4 rounded-xl border transition-all relative group flex gap-3 ${
                      n.isRead
                        ? 'bg-white border-gray-100 hover:border-gray-200'
                        : 'bg-amber-50/20 border-amber-100/50 hover:bg-amber-50/30'
                    }`}
                  >
                    {/* Icon Column */}
                    <div className="shrink-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        n.isRead ? 'bg-gray-100' : 'bg-amber-100/30'
                      }`}>
                        {getNotificationIcon(n.type)}
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getPriorityBadgeColor(n.priority)}`}>
                          {n.priority}
                        </span>
                        {n.module && (
                          <span className="text-[10px] text-gray-400 font-medium capitalize bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                            {n.module}
                          </span>
                        )}
                      </div>
                      <h4 className={`text-sm font-bold text-gray-900 mt-1.5 ${n.isRead ? 'font-medium text-gray-700' : ''}`}>
                        {n.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-gray-400 block mt-2">
                        {new Date(n.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>

                    {/* Action Hover Icons */}
                    <div className="absolute right-3 top-3 flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(n._id, e)}
                          title="Mark as read"
                          className="p-1 hover:bg-emerald-50 rounded text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(n._id, e)}
                        title="Delete notification"
                        className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination Footer */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
