import { motion } from 'framer-motion';
import { Users2, Phone, Mail, MapPin, Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import { useState } from 'react';

const mockClients = [
  { id: '1', name: 'Arun Kumar', email: 'arun@example.com', phone: '+91 9876543210', city: 'Tiruppur', events: 2, lastEvent: 'Wedding', totalSpend: 300000 },
  { id: '2', name: 'Priya Raj', email: 'priya@example.com', phone: '+91 8765432109', city: 'Coimbatore', events: 1, lastEvent: 'Birthday', totalSpend: 75000 },
  { id: '3', name: 'Karthik S', email: 'karthik@example.com', phone: '+91 7654321098', city: 'Chennai', events: 3, lastEvent: 'Corporate', totalSpend: 525000 },
  { id: '4', name: 'Divya M', email: 'divya@example.com', phone: '+91 6543210987', city: 'Tiruppur', events: 1, lastEvent: 'Valaikappu', totalSpend: 150000 },
];

export default function Clients() {
  const [search, setSearch] = useState('');
  const filtered = mockClients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.includes(search));

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">{mockClients.length} total clients</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">
          <Plus size={15} /> Add Client
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">City</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Events</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Total Spend</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((client, i) => (
                <motion.tr key={client.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C89B3C] to-[#5A1E1E] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                        <p className="text-xs text-gray-400">{client.lastEvent}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <p className="text-sm text-gray-700">{client.email}</p>
                    <p className="text-xs text-gray-400">{client.phone}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">{client.city}</td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-bold text-gray-900">{client.events}</span>
                    <span className="text-xs text-gray-400 ml-1">events</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-sm font-bold text-gray-900">₹{(client.totalSpend / 1000).toFixed(0)}k</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-[#C89B3C] hover:bg-amber-50 rounded-lg transition-colors"><Eye size={14} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={14} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
