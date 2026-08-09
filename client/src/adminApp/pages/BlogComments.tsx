import { useComments, useUpdateCommentStatus, useDeleteComment } from '../../shared/hooks/useBlog';
import { CheckCircle2, XCircle, Trash2 } from 'lucide-react';

export default function BlogComments() {
  const filters = { page: 1, limit: 20 };
  const { data: resp, isLoading } = useComments(filters as any);
  const updateStatus = useUpdateCommentStatus();
  const deleteComment = useDeleteComment();

  const comments = resp?.data || [];

  const handleApprove = async (id: string) => {
    await updateStatus.mutateAsync({ id, data: { status: 'Approved' } });
  };

  const handleReject = async (id: string) => {
    await updateStatus.mutateAsync({ id, data: { status: 'Rejected' } });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    await deleteComment.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Comments Moderation</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No comments found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((c: any) => (
              <div key={c._id} className="p-4 flex items-start justify-between">
                <div>
                  <p className="font-bold text-sm">{c.name} <span className="text-xs text-gray-400">• {new Date(c.createdAt).toLocaleString()}</span></p>
                  <p className="text-sm text-gray-700 mt-1">{c.message}</p>
                  <p className="text-xs text-gray-400 mt-2">Status: {c.status}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleApprove(c._id)} className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm flex items-center gap-2"><CheckCircle2 size={14} />Approve</button>
                  <button onClick={() => handleReject(c._id)} className="px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm flex items-center gap-2"><XCircle size={14} />Reject</button>
                  <button onClick={() => handleDelete(c._id)} className="px-3 py-2 bg-rose-50 text-rose-700 rounded-xl text-sm flex items-center gap-2"><Trash2 size={14} />Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
