import { SEO } from '../../shared/components/SEO';

const ClientBookings = () => {
  return (
    <div>
      <SEO title="My Bookings" description="View your bookings" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-500">
        You have no bookings yet.
      </div>
    </div>
  );
};

export default ClientBookings;
