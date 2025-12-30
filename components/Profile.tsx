import React from 'react';
import { UserStats, User as UserType } from '../types';
import { Button } from './Button';
import { ArrowLeft, User, Share2, Volume2, VolumeX, Medal, Star, Copy, LogOut } from 'lucide-react';

interface ProfileProps {
  user: UserType;
  stats: UserStats;
  onBack: () => void;
  onToggleSound: () => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, stats, onBack, onToggleSound, onLogout }) => {
  
  const copyReferral = () => {
    navigator.clipboard.writeText(stats.referralCode);
    alert('রেফারেল কোড কপি করা হয়েছে!');
  };

  const getAccuracy = () => {
    // Simple mock accuracy logic based on scores, can be improved with real tracking
    if (stats.completedQuestions === 0) return 0;
    // Assuming approx 8 pts per question average for calculation demo
    return Math.min(100, Math.round((stats.totalScore / (stats.completedQuestions * 10)) * 100));
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <User className="text-blue-400" /> প্রোফাইল
        </h2>
        <Button onClick={onBack} variant="ghost" className="!p-2"><ArrowLeft /></Button>
      </div>

      {/* User Info Card */}
      <div className="glass-panel p-6 rounded-2xl mb-6 flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 border-4 border-white/10 shadow-xl">
           <span className="text-4xl font-bold uppercase">{user.name.charAt(0)}</span>
        </div>
        <h3 className="text-2xl font-bold text-white">{user.name}</h3>
        <p className="text-gray-400 mb-2">{user.mobile}</p>
        <p className="text-sm px-3 py-1 rounded-full bg-white/10 border border-white/10">
            {stats.isPremium ? '💎 প্রিমিয়াম মেম্বার' : '👤 ফ্রি মেম্বার'}
        </p>
        
        <div className="grid grid-cols-3 gap-4 w-full mt-6">
            <div className="bg-black/20 p-3 rounded-xl text-center">
                <p className="text-xs text-gray-400">অ্যাকুরেসি</p>
                <p className="text-xl font-bold text-green-400">{getAccuracy()}%</p>
            </div>
            <div className="bg-black/20 p-3 rounded-xl text-center">
                <p className="text-xs text-gray-400">স্ট্রিক</p>
                <p className="text-xl font-bold text-orange-400">{stats.highestStreak} 🔥</p>
            </div>
            <div className="bg-black/20 p-3 rounded-xl text-center">
                <p className="text-xs text-gray-400">টোটাল গেম</p>
                <p className="text-xl font-bold text-blue-400">{Math.floor(stats.completedQuestions / 10)}</p>
            </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Medal className="text-yellow-400" /> অর্জনসমূহ
        </h3>
        <div className="grid grid-cols-1 gap-3">
            {stats.achievements.map(ach => (
                <div key={ach.id} className={`p-4 rounded-xl border flex items-center gap-4 ${ach.unlocked ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/30' : 'bg-white/5 border-white/10 opacity-60 grayscale'}`}>
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                        {ach.icon}
                    </div>
                    <div>
                        <h4 className={`font-bold ${ach.unlocked ? 'text-white' : 'text-gray-400'}`}>{ach.title}</h4>
                        <p className="text-sm text-gray-400">{ach.description}</p>
                    </div>
                    {ach.unlocked && <Star className="ml-auto text-yellow-400 fill-yellow-400" size={20} />}
                </div>
            ))}
        </div>
      </div>

      {/* Referral */}
      <div className="glass-panel p-6 rounded-2xl mb-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Share2 className="text-cyan-400" /> রেফার করুন
        </h3>
        <p className="text-sm text-gray-300 mb-4">বন্ধুদের আমন্ত্রণ জানান এবং প্রতি রেফারে ৳৫ বোনাস পান!</p>
        
        <div className="flex gap-2 mb-4">
            <div className="bg-black/40 border border-white/10 rounded-lg flex-1 p-3 font-mono text-center text-lg tracking-widest text-yellow-400 select-all">
                {stats.referralCode}
            </div>
            <Button onClick={copyReferral} variant="secondary" className="!p-3">
                <Copy size={20} />
            </Button>
        </div>
        
        <div className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-lg">
            <span className="text-gray-400">মোট রেফার: {stats.referralCount} জন</span>
            <span className="text-green-400 font-bold">আয়: ৳{stats.referralEarnings}</span>
        </div>
      </div>

      {/* Settings */}
      <div className="glass-panel p-6 rounded-2xl">
         <h3 className="text-xl font-bold text-white mb-4">সেটিংস</h3>
         
         <div className="flex items-center justify-between py-2 border-b border-white/10">
            <div className="flex items-center gap-3">
                {stats.soundEnabled ? <Volume2 className="text-green-400" /> : <VolumeX className="text-red-400" />}
                <div>
                    <p className="font-bold">সাউন্ড ইফেক্ট</p>
                    <p className="text-xs text-gray-400">গেমের শব্দ চালু/বন্ধ করুন</p>
                </div>
            </div>
            <button 
                onClick={onToggleSound}
                className={`w-12 h-6 rounded-full relative transition-colors ${stats.soundEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${stats.soundEnabled ? 'left-7' : 'left-1'}`}></div>
            </button>
         </div>

         <div className="mt-6">
            <Button onClick={onLogout} variant="danger" className="w-full text-sm">
                <LogOut size={16} /> লগ আউট
            </Button>
            <p className="text-center text-xs text-gray-600 mt-2">ভার্সন ২.২.০</p>
         </div>
      </div>
    </div>
  );
};