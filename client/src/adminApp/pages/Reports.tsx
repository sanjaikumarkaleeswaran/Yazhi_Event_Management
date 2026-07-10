import { FileText, Download } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Download business performance reports.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#18181B] text-white rounded-xl text-sm font-semibold hover:bg-[#2d2d2d] transition-colors">
          <Download size={15} /> Export All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { title: 'Monthly Revenue Report', desc: 'Detailed revenue breakdown by month', icon: '📊' },
          { title: 'Booking Summary', desc: 'All bookings with status and value', icon: '📅' },
          { title: 'Client Report', desc: 'Client acquisition and retention data', icon: '👥' },
          { title: 'Package Performance', desc: 'Most popular packages and conversions', icon: '📦' },
          { title: 'Inquiry Funnel', desc: 'Inquiry to booking conversion rates', icon: '🔄' },
          { title: 'Payment History', desc: 'Full transaction and payment log', icon: '💳' },
        ].map((r, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl">{r.icon}</div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900">{r.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
            </div>
            <Download size={16} className="text-gray-300 group-hover:text-[#C89B3C] transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}
