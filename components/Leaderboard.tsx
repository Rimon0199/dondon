import React from 'react';
import { LeaderboardEntry, AppView } from '../types';
import { Button } from './Button';
import { Trophy, Medal, Crown, ArrowLeft, AlertTriangle } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onBack: () => void;
  view: AppView; // To distinguish between rules and leaderboard
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, onBack, view }) => {
  
  if (view === AppView.RULES) {
    return (
        <div className="w-full max-w-2xl mx-auto p-6 animate-fade-in bg-slate-800/50 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-center gap-2 mb-6">
                <AlertTriangle className="text-red-400" />
                <h2 className="text-3xl font-bold text-center text-purple-400">কঠিন নিয়মাবলী</h2>
                <AlertTriangle className="text-red-400" />
            </div>
            
            <ul className="space-y-4 text-gray-200">
                <li className="flex gap-3 bg-white/5 p-3 rounded-lg">
                    <span className="bg-red-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-1 font-bold">1</span>
                    <p>প্রশ্ন হবে অনেক কঠিন! প্রতিটি প্রশ্নের জন্য মাত্র <strong>১২ সেকেন্ড</strong> সময় পাবেন।</p>
                </li>
                <li className="flex gap-3 bg-white/5 p-3 rounded-lg">
                    <span className="bg-red-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-1 font-bold">2</span>
                    <p><strong>নেগেটিভ মার্কিং:</strong> ভুল উত্তর দিলে ৫ পয়েন্ট কাটা যাবে।</p>
                </li>
                <li className="flex gap-3 bg-white/5 p-3 rounded-lg">
                    <span className="bg-green-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-1 font-bold">3</span>
                    <p><strong>স্ট্রিক বোনাস:</strong> টানা সঠিক উত্তর দিলে বোনাস পয়েন্ট পাবেন।</p>
                </li>
                <li className="flex gap-3 bg-white/5 p-3 rounded-lg">
                    <span className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-1 font-bold">4</span>
                    <p><strong>লাইফলাইন:</strong> '৫০/৫০' এবং '+সময়' ব্যবহার করতে পারবেন, তবে গেম প্রতি একবার।</p>
                </li>
                <li className="flex gap-3 bg-white/5 p-3 rounded-lg">
                    <span className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-1 font-bold">5</span>
                    <p>একটি প্রশ্ন দ্বিতীয়বার কখনোই আসবে না। তাই মনোযোগ দিয়ে খেলুন!</p>
                </li>
            </ul>
            <div className="mt-8 flex justify-center">
                <Button onClick={onBack} variant="primary">ফিরে যান</Button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
            <Trophy /> লিডারবোর্ড
          </h2>
          <Button onClick={onBack} variant="ghost" className="!p-2"><ArrowLeft /></Button>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => {
            let rankStyles = "bg-white/5 border-white/10";
            let icon = <span className="font-bold text-gray-400">#{entry.rank}</span>;

            if (entry.rank === 1) {
                rankStyles = "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50";
                icon = <Crown className="text-yellow-400" fill="currentColor" />;
            } else if (entry.rank === 2) {
                rankStyles = "bg-slate-400/20 border-slate-400/50";
                icon = <Medal className="text-slate-300" />;
            } else if (entry.rank === 3) {
                rankStyles = "bg-amber-700/20 border-amber-700/50";
                icon = <Medal className="text-amber-600" />;
            }

            return (
                <div key={entry.rank} className={`flex items-center justify-between p-4 rounded-xl border ${rankStyles} backdrop-blur-sm transition-transform hover:scale-[1.02]`}>
                    <div className="flex items-center gap-4">
                        <div className="w-8 flex justify-center">{icon}</div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">{entry.name}</span>
                            <span className="text-xs text-purple-300">{entry.prize}</span>
                        </div>
                    </div>
                    <div className="font-mono text-xl font-bold text-green-400">
                        {entry.score}
                    </div>
                </div>
            );
        })}
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500 p-4 bg-black/20 rounded-lg">
        সেরা ১০ জন খেলোয়াড় তাদের নিজস্ব পুরস্কার পাবেন!
      </div>
    </div>
  );
};