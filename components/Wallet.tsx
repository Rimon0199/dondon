import React, { useState } from 'react';
import { Button } from './Button';
import { ArrowLeft, CreditCard, Lock, CheckCircle, Wallet as WalletIcon, Crown, AlertTriangle, CalendarDays, Upload, Send } from 'lucide-react';
import { UserStats } from '../types';

interface WalletProps {
  stats: UserStats;
  onBack: () => void;
  onBuyPremium: (details: any) => void;
  onWithdraw: (amount: number, method: string, number: string) => void;
}

export const Wallet: React.FC<WalletProps> = ({ stats, onBack, onBuyPremium, onWithdraw }) => {
  const [activeTab, setActiveTab] = useState<'withdraw' | 'upgrade'>('upgrade');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bkash');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Payment Form State
  const [payMethod, setPayMethod] = useState('bkash');
  const [paySenderNumber, setPaySenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const amount = Number(withdrawAmount);

    if (amount < 200) {
      setError('মিনিমাম উইথড্র ২০০ টাকা।');
      return;
    }
    if (amount > stats.balance) {
      setError('পর্যাপ্ত ব্যালেন্স নেই।');
      return;
    }
    if (mobileNumber.length < 11) {
      setError('সঠিক মোবাইল নম্বর দিন।');
      return;
    }

    onWithdraw(amount, withdrawMethod, mobileNumber);
    setSuccessMsg('উইথড্র রিকোয়েস্ট সফল হয়েছে! ২৪ ঘন্টার মধ্যে টাকা পাবেন।');
    setWithdrawAmount('');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (paySenderNumber.length < 11) {
          setError('সঠিক সেন্ডার নম্বর দিন।');
          return;
      }
      if (trxId.length < 5) {
          setError('সঠিক Transaction ID দিন।');
          return;
      }
      // Note: In a real app we would upload the screenshot to a server
      // For this demo, we just verify it exists if we want, or just proceed
      
      setPayLoading(true);
      setTimeout(() => {
          onBuyPremium({
              method: payMethod,
              sender: paySenderNumber,
              trxId: trxId,
              hasScreenshot: !!screenshot
          });
          setPayLoading(false);
          setShowPaymentForm(false);
      }, 2000);
  };

  const getDaysRemaining = () => {
      if (!stats.subscriptionExpiry) return 0;
      const expiry = new Date(stats.subscriptionExpiry);
      const now = new Date();
      const diffTime = Math.abs(expiry.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
          <WalletIcon /> ওয়ালেট
        </h2>
        <Button onClick={onBack} variant="ghost" className="!p-2"><ArrowLeft /></Button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-6 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <p className="text-gray-400 text-sm mb-1">বর্তমান ব্যালেন্স</p>
        <h1 className="text-5xl font-bold text-white mb-2">৳ {stats.balance.toFixed(2)}</h1>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
          {stats.isPremium ? (
            <span className="text-yellow-400 flex items-center gap-1 font-bold"><Crown size={12} /> প্রিমিয়াম মেম্বার</span>
          ) : (
            <span className="text-gray-400">ফ্রি মেম্বার</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      {!showPaymentForm && (
        <div className="flex gap-4 mb-6">
            <button
            onClick={() => setActiveTab('upgrade')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'upgrade' ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
            <Crown size={18} /> প্ল্যান আপগ্রেড
            </button>
            <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'withdraw' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
            <CreditCard size={18} /> উইথড্র
            </button>
        </div>
      )}

      {/* Content */}
      <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative">
        
        {/* Payment Form Overlay logic */}
        {showPaymentForm ? (
            <div className="animate-fade-in">
                <button 
                    onClick={() => setShowPaymentForm(false)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Send className="text-yellow-400" /> পেমেন্ট ভেরিফিকেশন
                </h3>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl mb-6">
                    <p className="text-sm text-yellow-200 mb-2">নিচের নম্বরে <strong>৯৯ টাকা</strong> Send Money করুন:</p>
                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-yellow-500/20">
                        <div className="font-mono font-bold text-lg text-white">01712345678</div>
                        <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold">Personal</span>
                    </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                     {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">পেমেন্ট মেথড</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['bkash', 'nagad', 'rocket'].map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setPayMethod(m)}
                                    className={`p-2 rounded-lg border text-sm capitalize ${payMethod === m ? 'bg-purple-600 border-purple-400 text-white' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">সেন্ডার নম্বর (যে নম্বর থেকে টাকা পাঠিয়েছেন)</label>
                        <input 
                            type="number" 
                            value={paySenderNumber}
                            onChange={(e) => setPaySenderNumber(e.target.value)}
                            placeholder="017xxxxxxxx"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Transaction ID (TrxID)</label>
                        <input 
                            type="text" 
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            placeholder="8N7A6..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors uppercase"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">পেমেন্ট স্ক্রিনশট (বাধ্যতামূলক নয়)</label>
                        <div className="relative border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setScreenshot(e.target.files ? e.target.files[0] : null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-400">
                                {screenshot ? screenshot.name : "স্ক্রিনশট আপলোড করতে ট্যাপ করুন"}
                            </p>
                        </div>
                    </div>

                    <Button type="submit" className="w-full mt-4" loading={payLoading}>
                        সাবমিট করুন
                    </Button>
                </form>
            </div>
        ) : (
            <>
                {activeTab === 'upgrade' && (
                <div className="space-y-6">
                    {!stats.isPremium ? (
                    <>
                        <div className="text-center space-y-2">
                        <h3 className="text-2xl font-bold text-white">মাসিক প্রিমিয়াম সাবস্ক্রিপশন</h3>
                        <p className="text-gray-400">প্রতি মাসে মাত্র ৯৯ টাকা দিয়ে সদস্য হন।</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-white/10 bg-white/5 p-4 rounded-xl opacity-60">
                            <h4 className="font-bold text-gray-300 mb-2">ফ্রি প্ল্যান</h4>
                            <ul className="text-sm space-y-2 text-gray-400">
                            <li className="flex gap-2"><CheckCircle size={16} /> ৩০টি প্রশ্ন প্রতিদিন</li>
                            <li className="flex gap-2"><CheckCircle size={16} /> দৈনিক আয় ~১০ টাকা</li>
                            <li className="flex gap-2"><CheckCircle size={16} /> লাইফলাইন সুবিধা</li>
                            </ul>
                        </div>
                        <div className="border-2 border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-transparent p-4 rounded-xl relative">
                            <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-lg">বেস্ট ভ্যালু</div>
                            <h4 className="font-bold text-yellow-400 mb-2">গোল্ড মেম্বারশিপ</h4>
                            <ul className="text-sm space-y-2 text-gray-200">
                            <li className="flex gap-2"><CheckCircle size={16} className="text-yellow-400" /> ৩০০টি প্রশ্ন প্রতিদিন</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-yellow-400" /> মাসে ৮,৪০০ টাকা পর্যন্ত আয়ের সুযোগ</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-yellow-400" /> ৩x রেট (০.৯৩ টাকা/প্রশ্ন)</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-yellow-400" /> ফাস্ট উইথড্র সুবিধা</li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-2xl font-bold">৳৯৯</span>
                            <span className="text-xs text-gray-400">প্রতি মাসে</span>
                            </div>
                        </div>
                        </div>

                        <Button onClick={() => setShowPaymentForm(true)} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold text-lg">
                            সাবস্ক্রাইব করুন (৳৯৯/মাস)
                        </Button>
                        <p className="text-xs text-center text-gray-500">বিকাশ/নগদ এর মাধ্যমে পেমেন্ট করুন</p>
                    </>
                    ) : (
                    <div className="text-center py-10 space-y-4">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Crown size={40} className="text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-400">মেম্বারশিপ অ্যাক্টিভ আছে!</h3>
                        
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl max-w-sm mx-auto">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 flex items-center gap-2"><CalendarDays size={16} /> মেয়াদ শেষ হবে:</span>
                                <span className="text-yellow-400 font-bold">{getDaysRemaining()} দিন পর</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">প্ল্যান:</span>
                                <span className="text-white">মাসিক গোল্ড</span>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl text-left max-w-sm mx-auto">
                            <p className="text-sm text-gray-400">আজকের বাকি কুইজ: <span className="text-white font-bold">{stats.maxDailyGames * 10 - stats.completedQuestions} টি</span></p>
                        </div>
                    </div>
                    )}
                </div>
                )}

                {activeTab === 'withdraw' && (
                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 items-start">
                    <AlertTriangle className="text-yellow-500 shrink-0 mt-1" size={20} />
                    <div className="text-sm text-yellow-200/80">
                        <p className="font-bold mb-1">নিয়মাবলী:</p>
                        <ul className="list-disc pl-4 space-y-1">
                        <li>মিনিমাম উইথড্র ২০০ টাকা।</li>
                        <li>ফ্রি ইউজাররাও উইথড্র করতে পারবেন (শর্ত সাপেক্ষে)।</li>
                        <li>পেমেন্ট ২৪ ঘন্টার মধ্যে ক্লিয়ার করা হয়।</li>
                        </ul>
                    </div>
                    </div>

                    {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                        {error}
                    </div>
                    )}
                    
                    {successMsg && (
                    <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm text-center">
                        {successMsg}
                    </div>
                    )}

                    <div>
                    <label className="block text-sm text-gray-400 mb-1">পেমেন্ট মেথড</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                        type="button"
                        onClick={() => setWithdrawMethod('bkash')}
                        className={`p-3 rounded-lg border text-center transition-all ${withdrawMethod === 'bkash' ? 'bg-pink-600/20 border-pink-500 text-white' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                        >
                        বিকাশ
                        </button>
                        <button 
                        type="button"
                        onClick={() => setWithdrawMethod('nagad')}
                        className={`p-3 rounded-lg border text-center transition-all ${withdrawMethod === 'nagad' ? 'bg-orange-600/20 border-orange-500 text-white' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                        >
                        নগদ
                        </button>
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm text-gray-400 mb-1">মোবাইল নম্বর</label>
                    <input 
                        type="number" 
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="017xxxxxxxx"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    </div>

                    <div>
                    <label className="block text-sm text-gray-400 mb-1">টাকার পরিমাণ</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">৳</span>
                        <input 
                        type="number" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="200"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-8 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">মিনিমাম ২০০ টাকা</p>
                    </div>

                    <Button type="submit" className="w-full mt-2" disabled={stats.balance < 200}>
                    উইথড্র করুন
                    </Button>
                </form>
                )}
            </>
        )}
      </div>
    </div>
  );
};