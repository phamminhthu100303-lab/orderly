import React, { useState } from 'react';
import { Order } from '../types';
import { getPlatformMeta } from '../utils';
import { 
  X, 
  Star, 
  MessageSquare, 
  Heart, 
  Send, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'motion/react';

interface CustomerReviewsModalProps {
  orders: Order[];
  onClose: () => void;
  onReplyFeedback: (orderId: string, replyText: string) => void;
}

export const CustomerReviewsModal: React.FC<CustomerReviewsModalProps> = ({
  orders,
  onClose,
  onReplyFeedback,
}) => {
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Extract all orders with reviews
  const ordersWithReviews = orders.filter(o => o.feedback && o.feedback.rating);

  const starCounts = {
    5: ordersWithReviews.filter(o => o.feedback?.rating === 5).length,
    4: ordersWithReviews.filter(o => o.feedback?.rating && o.feedback.rating >= 4 && o.feedback.rating < 5).length,
    3: ordersWithReviews.filter(o => o.feedback?.rating && o.feedback.rating >= 3 && o.feedback.rating < 4).length,
  };

  const filtered = ordersWithReviews.filter(o => {
    if (filterStar === 5) return o.feedback?.rating === 5;
    if (filterStar === 4) return o.feedback?.rating && o.feedback.rating >= 4 && o.feedback.rating < 5;
    if (filterStar === 3) return o.feedback?.rating && o.feedback.rating >= 3 && o.feedback.rating < 4;
    return true;
  });

  const handleSendReply = (orderId: string) => {
    if (!replyText.trim()) return;
    onReplyFeedback(orderId, replyText);
    setActiveReplyId(null);
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full border border-pink-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-50 via-pink-50 to-rose-50 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Quicksand',sans-serif]">
                Đánh Giá & Nhận Xét Của Khách Hàng
              </h2>
              <p className="text-xs text-slate-500">
                Tổng hợp feedback từ Shopee, TikTok Shop, Lazada, Web & Direct Inbox
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Filter Chips */}
        <div className="p-4 bg-slate-50/60 border-b border-pink-50 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterStar(null)}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer ${
              filterStar === null
                ? 'bg-pink-500 text-white border-pink-500 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-pink-50/50'
            }`}
          >
            Tất cả ({ordersWithReviews.length})
          </button>
          <button
            onClick={() => setFilterStar(5)}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
              filterStar === 5
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50/50'
            }`}
          >
            <span>5 Sao</span>
            <span className="text-[11px] opacity-80">({starCounts[5]})</span>
          </button>
          <button
            onClick={() => setFilterStar(4)}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
              filterStar === 4
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50/50'
            }`}
          >
            <span>4 Sao</span>
            <span className="text-[11px] opacity-80">({starCounts[4]})</span>
          </button>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Chưa có đánh giá nào cho bộ lọc này.
            </div>
          ) : (
            filtered.map((order) => {
              const platformMeta = getPlatformMeta(order.platform);
              const fb = order.feedback!;

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-white border border-pink-100 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={order.customer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={order.customer.name}
                        className="w-8 h-8 rounded-full object-cover border border-pink-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-800">
                          {order.customer.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${platformMeta.bg} ${platformMeta.color}`}>
                            {platformMeta.label}
                          </span>
                          <span>· Đơn {order.orderNumber}</span>
                          <span>· {fb.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex text-amber-400 text-xs">
                      {'★'.repeat(Math.round(fb.rating))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium bg-pink-50/30 p-3 rounded-xl border border-pink-100/60 leading-relaxed">
                    "{fb.comment}"
                  </p>

                  {/* Feedback tags */}
                  {fb.tags && fb.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {fb.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                          ♥ {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Purchased items preview */}
                  <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-slate-400" />
                    <span>Sản phẩm: {order.items.map(i => `${i.name} (${i.variant || 'Mặc định'})`).join(', ')}</span>
                  </div>

                  {/* Shop Reply */}
                  {fb.reply ? (
                    <div className="p-3 rounded-xl bg-pink-50/70 border border-pink-200 text-xs space-y-1">
                      <div className="font-bold text-pink-700 text-[11px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-pink-500" />
                        <span>Phản hồi từ chủ shop:</span>
                      </div>
                      <p className="text-pink-900 text-xs">{fb.reply}</p>
                    </div>
                  ) : (
                    <div className="pt-1">
                      {activeReplyId === order.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Nhập câu trả lời dễ thương gửi đến khách..."
                            rows={2}
                            className="w-full p-2.5 rounded-xl bg-pink-50/30 border border-pink-200 text-xs focus:ring-1 focus:ring-pink-300 focus:outline-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setActiveReplyId(null)}
                              className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-100"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleSendReply(order.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-pink-500 text-white hover:bg-pink-600"
                            >
                              <Send className="w-3 h-3" />
                              <span>Gửi phản hồi</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveReplyId(order.id);
                            setReplyText('Dạ shop cảm ơn nàng nhiều nha, chúc nàng luôn xinh đẹp rạng rỡ ạ! 💕');
                          }}
                          className="text-xs font-bold text-pink-600 hover:text-pink-700 underline"
                        >
                          + Trả lời đánh giá này
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
