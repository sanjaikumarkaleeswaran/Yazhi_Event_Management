import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useBookings, useUpdateBooking } from '../../shared/hooks/useBookings';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
  Confirmed: '#10B981', // green
  Pending: '#F59E0B',   // yellow/amber
  Completed: '#3B82F6', // blue
  Cancelled: '#EF4444', // red
  Rescheduled: '#8B5CF6' // purple
};

export default function Calendar() {
  const { data: response, isLoading } = useBookings({ limit: 1000 });
  const bookings = response?.data || [];
  
  const updateBookingMutation = useUpdateBooking();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [warningModal, setWarningModal] = useState<{ id: string; date: string; existingBooking: string } | null>(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b: any) => 
      (statusFilter === 'All' || b.status === statusFilter) &&
      (b.clientName.toLowerCase().includes(search.toLowerCase()) || 
       b.eventType.toLowerCase().includes(search.toLowerCase()))
    );
  }, [bookings, search, statusFilter]);

  const events = useMemo(() => {
    return filteredBookings.map((b: any) => ({
      id: b.id || (b as any)._id,
      title: `${b.clientName} - ${b.eventType}`,
      start: b.eventDate,
      backgroundColor: STATUS_COLORS[b.status] || '#6B7280',
      borderColor: STATUS_COLORS[b.status] || '#6B7280',
      extendedProps: {
        ...b
      }
    }));
  }, [filteredBookings]);

  const handleEventDrop = (info: any) => {
    const droppedDate = info.event.startStr;
    const bookingId = info.event.id;
    
    // Conflict Detection (Double Booking Warning)
    // Check if any OTHER booking is on the exact same date (ignoring time for simplicity in events, or just check day)
    const droppedDay = new Date(droppedDate).toISOString().split('T')[0];
    
    const conflict = bookings.find((b: any) => {
      if (b.id === bookingId || (b as any)._id === bookingId) return false;
      const bDay = new Date(b.eventDate).toISOString().split('T')[0];
      return bDay === droppedDay && (b.status === 'Confirmed' || b.status === 'Pending');
    });

    if (conflict) {
      // Revert the event visually temporarily, open warning modal
      info.revert();
      setWarningModal({
        id: bookingId,
        date: droppedDate,
        existingBooking: conflict.clientName
      });
      return;
    }

    updateBookingMutation.mutate({
      id: bookingId,
      data: { eventDate: droppedDate }
    });
  };

  const confirmReschedule = () => {
    if (warningModal) {
      updateBookingMutation.mutate({
        id: warningModal.id,
        data: { eventDate: warningModal.date }
      });
      setWarningModal(null);
    }
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading Calendar...</div>;
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and schedule your events</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events by client or type..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30" 
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === s ? 'bg-[#18181B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden calendar-container">
        <style>{`
          .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 700; color: #111827; }
          .fc .fc-button-primary { background-color: #18181B; border-color: #18181B; border-radius: 0.5rem; text-transform: capitalize; }
          .fc .fc-button-primary:hover { background-color: #374151; border-color: #374151; }
          .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #C89B3C; border-color: #C89B3C; }
          .fc-theme-standard td, .fc-theme-standard th { border-color: #f3f4f6; }
          .fc-event { cursor: pointer; padding: 2px 4px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: none; }
          .fc-day-today { background-color: #fefce8 !important; }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          events={events}
          editable={true} // Enables drag/drop and resize
          droppable={true}
          eventDrop={handleEventDrop}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={true}
        />
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedEvent.clientName}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedEvent.eventType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-gray-100`} style={{ color: STATUS_COLORS[selectedEvent.status] }}>
                    {selectedEvent.status}
                  </span>
                  <button onClick={() => setSelectedEvent(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {[
                  ['Date', new Date(selectedEvent.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
                  ['Venue', selectedEvent.venue || '—'],
                  ['Package', selectedEvent.packageName || '—'],
                  ['Amount', `₹${selectedEvent.amount?.toLocaleString('en-IN')}`],
                  ['Phone', selectedEvent.phone],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{k}</span>
                    <span className="text-sm text-gray-800 font-medium text-right max-w-[60%]">{v as React.ReactNode}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50 rounded-b-2xl">
                <Link to="/admin/bookings" className="flex-1 text-center py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">
                  Manage Booking
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conflict Warning Modal */}
      <AnimatePresence>
        {warningModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Double Booking Detected</h3>
              <p className="text-sm text-gray-600 mb-6">
                You already have a booking for <strong>{warningModal.existingBooking}</strong> on this date. Are you sure you want to schedule this event on the same day?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setWarningModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={confirmReschedule} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors">
                  Yes, Reschedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
