import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Smartphone, Lock, Sparkles, Copy, Check } from 'lucide-react';
import { apiRequest } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  posterId?: string;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  posterId,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [mobileNumber, setMobileNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = async (useAutoDemo = false) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const activeTrx = useAutoDemo
      ? `${method.toUpperCase()}_TXN_${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      : trxId || `${method.toUpperCase()}_TXN_${Date.now().toString().slice(-6)}`;

    try {
      if (posterId) {
        await apiRequest(`/posters/${posterId}/unlock-paid`, {
          method: 'PATCH',
          body: JSON.stringify({
            paymentMethod: method === 'bkash' ? 'bKash' : 'Nagad',
            transactionId: activeTrx,
          }),
        });
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setPaymentSuccess(false);
      }, 1400);
    } catch (err: any) {
      setErrorMessage(err.message || 'পেমেন্ট ভেরিফাই করতে সমস্যা হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`p-4 text-white flex items-center justify-between transition-colors ${
          method === 'bkash' ? 'bg-gradient-to-r from-pink-600 to-rose-700' : 'bg-gradient-to-r from-orange-500 to-amber-600'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            <div>
              <h3 className="font-bold text-base">প্রিমিয়াম ওয়াটারমার্ক-মুক্ত এক্সপোর্ট</h3>
              <p className="text-xs text-white/80">১২০০×১৬০০ হাই-রেজুলেশন প্রিন্ট কোয়ালিটি</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {paymentSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-emerald-400">পেমেন্ট সফল হয়েছে!</h4>
              <p className="text-xs text-slate-300">ওয়াটারমার্ক ছাড়া প্রিমিয়াম পোস্টার আনলক করা হয়েছে। এখনই ডাউনলোড শুরু হচ্ছে...</p>
            </div>
          ) : (
            <>
              {/* Fee Notice */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">চার্জ (ট্যাক্স সহ):</span>
                  <div className="text-lg font-bold text-amber-400">৳৫০ <span className="text-xs font-normal text-slate-300">(৫০ টাকা মাত্র)</span></div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-3 h-3" /> লাইফটাইম অ্যাক্সেস
                  </span>
                </div>
              </div>

              {/* Payment Method Switcher */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">পেমেন্ট মেথড বেছে নিন:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('bkash')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                      method === 'bkash'
                        ? 'bg-pink-950/60 border-pink-500 text-pink-300 shadow-md shadow-pink-950/50'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-pink-500" />
                    বিকাশ (bKash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('nagad')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                      method === 'nagad'
                        ? 'bg-orange-950/60 border-orange-500 text-orange-300 shadow-md shadow-orange-950/50'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-orange-500" />
                    নগদ (Nagad)
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-xs bg-slate-950/50 border border-slate-800 rounded-lg p-2.5 space-y-1 text-slate-300">
                <p className="font-semibold text-slate-200">মার্চেন্ট পেমেন্ট ধাপ:</p>
                <p>১. আপনার {method === 'bkash' ? 'bKash' : 'Nagad'} অ্যাপে যান এবং <strong>Send Money / Payment</strong> সিলেক্ট করুন।</p>
                <p>২. প্রাপক নম্বর: <code className="text-amber-300 font-mono font-bold">01700-123456</code> (মার্চেন্ট অ্যাকাউন্ট)</p>
                <p>৩. নিচে আপনার ট্রানজাকশন আইডি (TrxID) দিয়ে কনফার্ম করুন।</p>
              </div>

              {/* Input Form */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">আপনার {method === 'bkash' ? 'বিকাশ' : 'নগদ'} একাউন্ট নম্বর:</label>
                  <input
                    type="text"
                    placeholder="01XXXXXXXXX"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">ট্রানজাকশন আইডি (TrxID):</label>
                  <input
                    type="text"
                    placeholder="e.g. 9J4K2L1M"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-2 rounded-lg">
                  {errorMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulatePayment(false)}
                  disabled={isProcessing}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                    method === 'bkash' ? 'bg-pink-600 hover:bg-pink-500' : 'bg-orange-600 hover:bg-orange-500'
                  } disabled:opacity-50`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isProcessing ? 'যাচাই করা হচ্ছে...' : 'পেমেন্ট নিশ্চিত করুন (Confirm)'}
                </button>

                {/* Instant 1-Click Demo Button for Testing */}
                <button
                  type="button"
                  onClick={() => handleSimulatePayment(true)}
                  disabled={isProcessing}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  ১-ক্লিকে ফ্রি ডেমো টেস্ট পেমেন্ট (Instant Demo Pay)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
