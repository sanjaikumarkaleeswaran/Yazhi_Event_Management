import { SEO } from '../../shared/components/SEO';
import { useAuth } from '../../shared/context/AuthContext';
import { useMyBookings } from '../../shared/hooks/useBookings';
import { ShoppingBag, Calendar, CreditCard, FileText, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocuments } from '../../shared/hooks/useDocuments';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-4 rounded-lg bg-${color}-50 text-${color}-600`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ClientDashboard = () => {
  const { user } = useAuth();
  const { data: bookingsResponse, isLoading } = useMyBookings();
  const { openDocument, getInvoiceUrl, getContractUrl } = useDocuments();

  const bookings = bookingsResponse?.data || [];
  const totalBookings = bookings.length;
  const upcomingEvents = bookings.filter((b: any) => new Date(b.eventDate) >= new Date() && b.status !== 'Cancelled').length;
  
  const pendingAmount = bookings
    .filter((b: any) => b.status === 'Pending')
    .reduce((sum: number, b: any) => sum + (b.amount || 0), 0);

  return (
    <div className="space-y-6">
      <SEO title="Client Dashboard" description="Manage your Yazhi events" canonicalUrl="/dashboard" />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Client'}. Here's an overview of your events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Bookings" value={isLoading ? '...' : totalBookings} icon={ShoppingBag} color="blue" />
        <StatCard title="Upcoming Events" value={isLoading ? '...' : upcomingEvents} icon={Calendar} color="green" />
        <StatCard title="Pending Payments" value={isLoading ? '...' : `₹${pendingAmount.toLocaleString()}`} icon={CreditCard} color="yellow" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings & Contracts</h2>
          <Link to="/client/bookings" className="text-sm text-[#C89B3C] font-medium hover:underline">View All</Link>
        </div>
        
        {isLoading ? (
           <div className="flex justify-center p-8">
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C89B3C]"></div>
           </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No bookings found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.slice(0, 3).map((booking: any) => (
              <div key={booking.id || booking._id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{booking.eventType}</p>
                    <span className="text-xs font-mono text-gray-400">#{booking.bookingNumber || booking._id?.slice(-6)}</span>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(booking.eventDate).toLocaleDateString()} · {booking.venue || 'Venue TBD'}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDocument(getInvoiceUrl(booking.id || booking._id))}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
                  >
                    <FileText size={13} /> Invoice
                  </button>
                  <button
                    onClick={() => openDocument(getContractUrl(booking.id || booking._id))}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900 text-white rounded-lg text-xs font-medium hover:bg-rose-800 transition-colors"
                  >
                    <Printer size={13} /> Contract
                  </button>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                    booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
