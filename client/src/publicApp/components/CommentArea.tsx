import React, { useState } from 'react';
import { useComments, useCreateComment } from '../../shared/hooks/useBlog';

export default function CommentArea({ postId }: { postId: string }) {
  const { data: commentsResp, isLoading } = useComments({ blogId: postId, status: 'Approved' });
  const createComment = useCreateComment();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    await createComment.mutateAsync({ blogId: postId, name, email, message });
    setName(''); setEmail(''); setMessage('');
    alert('Comment submitted and awaiting moderation');
  };

  const comments = commentsResp?.data || [];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="px-3 py-2 border rounded" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" className="px-3 py-2 border rounded" />
        </div>
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your comment..." className="w-full mt-3 px-3 py-2 border rounded min-h-[100px]" />
        <div className="mt-3 text-right">
          <button type="submit" className="px-4 py-2 bg-[#C89B3C] text-white rounded-xl text-sm">Submit Comment</button>
        </div>
      </form>

      <div className="space-y-3">
        {isLoading ? <p className="text-sm text-gray-400">Loading comments...</p> : (
          comments.length === 0 ? <p className="text-sm text-gray-400">No comments yet.</p> : (
            comments.map((c: any) => (
              <div key={c._id} className="bg-white p-3 rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm">{c.name[0]}</div>
                  <div>
                    <p className="font-bold text-sm">{c.name} <span className="text-[11px] text-gray-400 ml-2">{new Date(c.createdAt).toLocaleString()}</span></p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{c.message}</p>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
