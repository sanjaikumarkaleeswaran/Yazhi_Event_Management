import { SEO } from '../../shared/components/SEO';
import { useAuth } from '../../shared/context/AuthContext';

const ClientProfile = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <SEO title="My Profile" description="Your Yazhi account profile" canonicalUrl="/dashboard/profile" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-gray-900">{user?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-gray-900 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
