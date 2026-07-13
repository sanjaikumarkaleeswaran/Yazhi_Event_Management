import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Plus, Eye, X, Search, ChevronLeft, ChevronRight, Download, 
  RefreshCcw, Landmark, Clock, FileText, Activity
} from 'lucide-react';
import { 
  usePayments, 
  useCreateManualPayment, 
  useCreateRazorpayOrder, 
  useVerifyRazorpayPayment, 
  useRefundPayment 
} from '../../shared/hooks/usePayments';

const METHODS = ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque', 'Bank Transfer', 'Razorpay'];
const STATUSES = ['Pending', 'Partially Paid', 'Paid', 'Failed', 'Cancelled', 'Refunded'];
const PAGE_SIZE = 8;

const STATUS_STYLES: Record<string, string> = {
  'Paid': 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  'Pending': 'bg-amber-50 text-amber-700 border border-amber-100',
  'Partially Paid': 'bg-blue-50 text-blue-700 border border-blue-100',
  'Refunded': 'bg-purple-50 text-purple-700 border border-purple-100',
  'Failed': 'bg-rose-50 text-rose-700 border border-rose-100',
  'Cancelled': 'bg-gray-50 text-gray-700 border border-gray-100',
};

export default function Payments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'create' | 'view' | 'refund' | 'invoice' | null>(null);
  const [selected, setSelected] = useState<any>(null);

  // Queries
  const { data: paymentsResp, isLoading } = usePayments({
    page,
    limit: PAGE_SIZE,
    search,
    status: statusFilter === 'All' ? undefined : statusFilter,
    paymentMethod: methodFilter === 'All' ? undefined : methodFilter
  });

  const createPaymentMutation = useCreateManualPayment();
  const createOrderMutation = useCreateRazorpayOrder();
  const verifyPaymentMutation = useVerifyRazorpayPayment();
  const refundMutation = useRefundPayment();

  const { register, handleSubmit, reset } = useForm();

  const payments = paymentsResp?.data || [];
  const meta = paymentsResp?.meta || { total: 0, totalPages: 1 };

  // Calculate high-level financial overview from loaded dataset or sum aggregates
  const totalInvoiced = payments.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalPaid = payments.reduce((acc: number, curr: any) => acc + (curr.status === 'Paid' || curr.status === 'Partially Paid' ? curr.amount : 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const refundTotal = payments.reduce((acc: number, curr: any) => acc + (curr.status === 'Refunded' ? curr.amount : 0), 0);
  const collectionRate = totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : 0;

  const handleCreatePayment = (data: any) => {
    createPaymentMutation.mutate({
      ...data,
      amount: Number(data.amount),
      remainingAmount: Number(data.amount) - (data.status === 'Paid' ? Number(data.amount) : 0),
      paymentDate: data.status === 'Paid' ? new Date() : undefined
    }, {
      onSuccess: () => {
        setModal(null);
        reset();
      }
    });
  };

  const handleRefund = (id: string) => {
    refundMutation.mutate(id, {
      onSuccess: () => {
        setModal(null);
      }
    });
  };

  const simulateRazorpay = (payment: any) => {
    // Generate order and mock verification signature
    createOrderMutation.mutate({
      bookingId: payment.bookingId?._id || payment.bookingId,
      amount: payment.amount,
      clientId: payment.clientId?._id || payment.clientId
    }, {
      onSuccess: (orderResp) => {
        const orderId = orderResp.data.order.id;
        const tempPaymentId = orderResp.data.payment._id;
        // Verify payment signature
        verifyPaymentMutation.mutate({
          razorpay_order_id: orderId,
          razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(7),
          razorpay_signature: 'sig_mock_' + Math.random().toString(36).substring(7),
          payment_id: tempPaymentId
        }, {
          onSuccess: () => {
            alert('Razorpay sandbox payment simulated successfully!');
          }
        });
      }
    });
  };

  const handleExportCSV = () => {
    if (!payments.length) return;
    const headers = ['Payment No', 'Invoice No', 'Client', 'Amount', 'Method', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...payments.map((p: any) => [
        p.paymentNumber,
        p.invoiceId || 'N/A',
        p.clientId?.firstName + ' ' + p.clientId?.lastName,
        p.amount,
        p.paymentMethod,
        p.status,
        new Date(p.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments_report_${Date.now()}.csv`;
    link.click();
  };

  const formatCurrency = (val: number) => `₹${val?.toLocaleString('en-IN')}`;

  const inp = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Manage corporate financials, transaction logs, and Razorpay logs.</p>
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={15} /> Add Record
        </button>
      </div>

      {/* KPI Overviews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalPaid)}</h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium">{collectionRate}% Collection Rate</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><Landmark size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoiced</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalInvoiced)}</h3>
            <p className="text-xs text-gray-400 mt-1">Gross total invoices</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 text-gray-600"><FileText size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outstanding</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalOutstanding)}</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">Pending collection</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600"><Clock size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Refunds Issued</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(refundTotal)}</h3>
            <p className="text-xs text-purple-600 mt-1 font-medium">Refunded transactions</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600"><RefreshCcw size={20} /></div>
        </div>
      </div>

      {/* Main Table Block */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search payment ID, invoice, client..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30"
              />
            </div>
            
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              value={methodFilter} 
              onChange={e => setMethodFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700"
            >
              <option value="All">All Methods</option>
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Payment No', 'Invoice ID', 'Client', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Activity className="animate-spin text-gray-300 mx-auto" />
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No transaction records found.</td>
                </tr>
              ) : (
                payments.map((p: any, i: number) => (
                  <motion.tr 
                    key={p._id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-4 py-4 text-xs font-bold text-gray-800">{p.paymentNumber}</td>
                    <td className="px-4 py-4 text-xs text-gray-500">{p.invoiceId || 'N/A'}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {p.clientId ? `${p.clientId.firstName} ${p.clientId.lastName}` : 'N/A'}
                      </p>
                      <p className="text-[10px] text-gray-400">{p.clientId?.email}</p>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{p.paymentMethod}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => { setSelected(p); setModal('view'); }} 
                          className="p-1.5 text-gray-400 hover:text-[#C89B3C] hover:bg-amber-50 rounded-lg"
                        >
                          <Eye size={14} />
                        </button>
                        {p.status === 'Paid' && (
                          <button 
                            onClick={() => { setSelected(p); setModal('refund'); }} 
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                          >
                            <RefreshCcw size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelected(p); setModal('invoice'); }} 
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <FileText size={14} />
                        </button>
                        {p.paymentMethod === 'Razorpay' && p.status === 'Pending' && (
                          <button 
                            onClick={() => simulateRazorpay(p)} 
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold"
                          >
                            Pay Sandbox
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing Page {meta.page} of {meta.totalPages} ({meta.total} records total)
          </p>
          <div className="flex gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} 
              disabled={page === meta.totalPages}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide / Drawer Modals */}
      <AnimatePresence>
        {/* Record/Create Payment */}
        {modal === 'create' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Record Manual Payment</h2>
                <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(handleCreatePayment)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={lbl}>Client ID *</label>
                    <input {...register('clientId', { required: true })} className={inp} placeholder="Client ObjectId" />
                  </div>
                  <div>
                    <label className={lbl}>Booking ID *</label>
                    <input {...register('bookingId', { required: true })} className={inp} placeholder="Booking ObjectId" />
                  </div>
                  <div>
                    <label className={lbl}>Invoice Number</label>
                    <input {...register('invoiceId')} className={inp} placeholder="INV-2026-X" />
                  </div>
                  <div>
                    <label className={lbl}>Amount (INR) *</label>
                    <input type="number" {...register('amount', { required: true })} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Payment Method</label>
                    <select {...register('paymentMethod')} className={inp}>
                      {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Status</label>
                    <select {...register('status')} className={inp}>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Notes</label>
                    <textarea {...register('notes')} rows={2} className={`${inp} resize-none`} placeholder="Custom internal notes..." />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">
                    Save Transaction
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* View Payment Drawer / Details */}
        {modal === 'view' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
              <button onClick={() => setModal(null)} className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
              
              <div className="text-center mb-6">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLES[selected.status]}`}>
                  {selected.status}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(selected.amount)}</h3>
                <p className="text-xs text-gray-500 mt-1">Payment Reference: {selected.paymentNumber}</p>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  ['Invoice ID', selected.invoiceId || 'N/A'],
                  ['Client', selected.clientId ? `${selected.clientId.firstName} ${selected.clientId.lastName}` : 'N/A'],
                  ['Payment Method', selected.paymentMethod],
                  ['Gateway', selected.gateway || 'Manual'],
                  ['Transaction ID', selected.transactionId || 'N/A'],
                  ['Created At', new Date(selected.createdAt).toLocaleString()]
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-none">
                    <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">{k}</span>
                    <span className="text-gray-800 font-semibold">{v}</span>
                  </div>
                ))}
              </div>

              {/* Payment Timeline */}
              {selected.timeline && selected.timeline.length > 0 && (
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Timeline</h4>
                  <div className="space-y-3">
                    {selected.timeline.map((t: any, index: number) => (
                      <div key={index} className="flex gap-3 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C89B3C] mt-1.5" />
                        <div>
                          <p className="font-semibold text-gray-800">{t.action}</p>
                          <p className="text-gray-500 mt-0.5">{t.description}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{new Date(t.date).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Refund confirmation modal */}
        {modal === 'refund' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4"><RefreshCcw size={20} className="text-purple-600" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Process Refund?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to process a full refund of <strong>{formatCurrency(selected.amount)}</strong> for payment <strong>{selected.paymentNumber}</strong>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => handleRefund(selected._id)} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors">
                  Refund Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Invoice Preview & Print Modal */}
        {modal === 'invoice' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Invoice Preview</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
                    <Download size={13} /> Print Invoice
                  </button>
                  <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
              </div>

              {/* Invoice Layout */}
              <div className="p-8 space-y-8" id="printable-invoice">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-extrabold text-[#C89B3C] tracking-wide">YAZHI EVENTS</h1>
                    <p className="text-xs text-gray-400 mt-1">Premium Event Management & Design</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-900">INVOICE</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Invoice Number: {selected.invoiceId || 'INV-2026-MOCK'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Date: {new Date(selected.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t border-b border-gray-100 py-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Billed To</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {selected.clientId ? `${selected.clientId.firstName} ${selected.clientId.lastName}` : 'Client N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{selected.clientId?.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{selected.clientId?.phone || 'Phone N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Event Reference</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {selected.bookingId ? `Booking #${selected.bookingId.bookingNumber}` : 'Booking Reference N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Event Type: {selected.bookingId?.eventType || 'N/A'}</p>
                  </div>
                </div>

                {/* Ledger Items */}
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50 text-gray-800">
                      <td className="py-4 font-medium">Event Management Services & Package Booking Fee</td>
                      <td className="py-4 text-right font-semibold">{formatCurrency(selected.amount)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end pt-4">
                  <div className="w-64 space-y-2.5 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatCurrency(selected.amount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>GST (18% Included)</span>
                      <span>{formatCurrency(selected.amount * 0.18)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
                      <span>Total Paid</span>
                      <span>{formatCurrency(selected.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
