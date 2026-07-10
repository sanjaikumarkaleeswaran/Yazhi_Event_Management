import { Activity, Clock, User, Globe, Shield } from 'lucide-react';

const logs = [
  { id: 1, action: 'Logged in', user: 'Admin', ip: '192.168.1.1', time: '5 min ago', type: 'auth' },
  { id: 2, action: 'Created package: Gold Premium', user: 'Admin', ip: '192.168.1.1', time: '1 hour ago', type: 'create' },
  { id: 3, action: 'Updated inquiry #INQ-003 status to Confirmed', user: 'Admin', ip: '192.168.1.1', time: '2 hours ago', type: 'update' },
  { id: 4, action: 'Uploaded 5 gallery images', user: 'Admin', ip: '192.168.1.1', time: '3 hours ago', type: 'upload' },
  { id: 5, action: 'Deleted testimonial #T-011', user: 'Admin', ip: '192.168.1.1', time: '1 day ago', type: 'delete' },
];

const typeColors: Record<string, string> = {
  auth: 'bg-blue-100 text-blue-600',
  create: 'bg-green-100 text-green-600',
  update: 'bg-amber-100 text-amber-600',
  delete: 'bg-red-100 text-red-600',
  upload: 'bg-violet-100 text-violet-600',
};

export default function ActivityLogs() {
  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Track all admin actions and system events.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {logs.map((log, i) => (
            <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${typeColors[log.type]}`}>
                {log.type === 'auth' ? <Shield size={14} /> : log.type === 'delete' ? '✕' : log.type === 'upload' ? '↑' : log.type === 'create' ? '+' : '✎'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{log.action}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-400"><User size={10} /> {log.user}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Globe size={10} /> {log.ip}</span>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0"><Clock size={10} /> {log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
