import { SEO } from '../../shared/components/SEO';
import { useMyBookings } from '../../shared/hooks/useBookings';
import { Calendar, MapPin, Tag } from 'lucide-react';

const ClientBookings = () => {
  const { data: response, isLoading, error } = useMyBookings();
  const bookings = response?.data || [];

  return (
    <div className="space-y-6">
      <SEO title="My Bookings" description="View your Yazhi events bookings" canonicalUrl="/dashboard/bookings" />
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C89B3C]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">Failed to load bookings.</div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
          <p>You don't have any event bookings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking: any) => (
            <div key={booking.id || booking._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.eventType}</h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <Calendar size={14} className="mr-1.5" />
                    {new Date(booking.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                  booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-50 space-y-2">
                 {booking.venue && (
                   <p className="text-sm text-gray-600 flex items-center">
                     <MapPin size={14} className="mr-2 text-gray-400" />
                     {booking.venue}
                   </p>
                 )}
                 {booking.packageName && (
                   <p className="text-sm text-gray-600 flex items-center">
                     <Tag size={14} className="mr-2 text-gray-400" />
                     {booking.packageName}
                   </p>
                 )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                 <span className="text-sm text-gray-500">Amount</span>
                 <span className="text-lg font-bold text-gray-900">₹{booking.amount?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientBookings;
