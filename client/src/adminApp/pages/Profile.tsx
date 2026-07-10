import { useAuth } from '../../shared/context/AuthContext';
import { User, Mail, Shield, Camera } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="space-y-6 max-w-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your admin profile and security settings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#C89B3C] to-[#5A1E1E] flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#C89B3C] rounded-full flex items-center justify-center text-white shadow-md">
              <Camera size={13} />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Admin User'}</h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full mt-1">
              <Shield size={10} /> {user?.role || 'Administrator'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: User, label: 'Full Name', value: user?.name || 'Admin User' },
            { icon: Mail, label: 'Email Address', value: user?.email || 'admin@yazhievents.com' },
            { icon: Shield, label: 'Role', value: user?.role || 'Administrator' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <f.icon size={15} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium">{f.label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
