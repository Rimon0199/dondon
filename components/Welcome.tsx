import React from 'react';
import { Play, Trophy, BookOpen, Crown, Wallet, User } from 'lucide-react';
import { Button } from './Button';
import { UserStats } from '../types';
import { initAudio } from '../utils/soundEffects';

interface WelcomeProps {
  onStart: () => void;
  onShowLeaderboard: () => void;
  onShowRules: () => void;
  onShowWallet: () => void;
  onShowProfile: () => void;
  stats: UserStats;
  isQuestionsReady?: boolean;
}

export const Welcome: React.FC<WelcomeProps> = ({ 
  onStart, 
  onShowLeaderboard, 
  onShowRules, 
  onShowWallet,
  onShowProfile,
  stats,
  isQuestionsReady = false
}) => {
  const canPlay = stats.gamesPlayedToday < stats.maxDailyGames;

  const handleStart = () => {
    initAudio(); // Initialize audio context on user gesture
    onStart();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6 animate-fade-in px-4">
      {/* Top Bar for Profile */}
      <div className="absolute top-0 right-0 p-4 z-20">
        <button onClick={onShowProfile} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all border border-white/10">
            <User className="text-blue-300" size={24} />
        </button>
      </div>

      <div className="relative mt-8 md:mt-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75 animate-pulse"></div>
        <div className="relative bg-slate-900 p-6 rounded-full border border-white/10">
          <Crown size={64} className={stats.isPremium ? "text-yellow-400" : "text-gray-400"} />
          {stats.isPremium && (
            <div className="absolute bottom-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                PREMIUM
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
          ধনধান কুইজ
        </h1>
        <p className="text-lg text-gray-300 max-w-lg mx-auto leading-relaxed">
          {stats.isPremium 
            ? "আপনি প্রিমিয়াম মেম্বার! প্রতিদিন ৩০০ প্রশ্ন খেলে ২৮০ টাকা পর্যন্ত আয় করুন।" 
            : "ফ্রি প্ল্যানে প্রতিদিন ৩০ প্রশ্ন খেলে ১০ টাকা পর্যন্ত আয় করুন। বেশি আয়ের জন্য আপগ্রেড করুন।"}
        </p>
      </div>

      {/* Monetization Ad Banner */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-2 rounded-lg my-2 flex items-center justify-center min-h-[60px]">
         <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">SPONSORED AD</p>
            <p className="text-sm text-gray-300 font-bold">এখানে Google AdMob এর বিজ্ঞাপন বসবে</p>
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl">
        <div className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center h-24">
          <Trophy className="text-yellow-400 mb-1 w-5 h-5" />
          <span className="text-xs text-gray-400">স্কোর</span>
          <span className="text-lg font-bold">{stats.totalScore}</span>
        </div>
        
        <div 
            className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-white/5 transition-colors border-green-500/30"
            onClick={onShowWallet}
        >
          <Wallet className="text-green-400 mb-1 w-5 h-5" />
          <span className="text-xs text-gray-400">ব্যালেন্স</span>
          <span className="text-lg font-bold">৳ {stats.balance.toFixed(2)}</span>
        </div>

        <div className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center h-24">
          <Play className="text-blue-400 mb-1 w-5 h-5" />
          <span className="text-xs text-gray-400">আজকের গেম</span>
          <span className="text-lg font-bold">{stats.gamesPlayedToday}/{stats.maxDailyGames}</span>
        </div>

        <div className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center h-24">
            <Crown className="text-purple-400 mb-1 w-5 h-5" />
            <span className="text-xs text-gray-400">স্ট্যাটাস</span>
            <span className="text-xs font-bold uppercase mt-1">{stats.isPremium ? "Premium" : "Free"}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md pt-4">
        {canPlay ? (
          <Button 
            onClick={handleStart} 
            className="w-full text-lg py-4 shadow-xl shadow-purple-500/20"
            disabled={!isQuestionsReady}
            loading={!isQuestionsReady}
          >
            <Play size={24} className="fill-current" /> 
            {isQuestionsReady ? "খেলা শুরু করুন" : "প্রস্তুত হচ্ছে..."}
          </Button>
        ) : (
          <div className="w-full space-y-3">
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                আজকের কুইজ লিমিট শেষ!
            </div>
            {!stats.isPremium && (
                <Button onClick={onShowWallet} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black">
                    <Crown size={20} /> লিমিট বাড়াতে প্রিমিয়াম কিনুন
                </Button>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-3">
            <Button onClick={onShowLeaderboard} variant="secondary" className="flex-col gap-1 text-xs py-2 h-auto">
                <Trophy size={18} /> সেরা ১০
            </Button>
            <Button onClick={onShowWallet} variant="secondary" className="flex-col gap-1 text-xs py-2 h-auto">
                <Wallet size={18} /> ওয়ালেট
            </Button>
            <Button onClick={onShowRules} variant="secondary" className="flex-col gap-1 text-xs py-2 h-auto">
                <BookOpen size={18} /> নিয়ম
            </Button>
        </div>
      </div>
    </div>
  );
};