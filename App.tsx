import React, { useState, useEffect } from 'react';
import { Welcome } from './components/Welcome';
import { QuizGame } from './components/QuizGame';
import { Leaderboard } from './components/Leaderboard';
import { Wallet } from './components/Wallet';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard'; // Import Admin
import { AppView, UserStats, LeaderboardEntry, Question, GameResult, User } from './types';
import { generateQuizQuestions } from './services/geminiService';
import { authService } from './services/authService';
import { adminService } from './services/adminService'; // Import Admin Service
import { setSoundEnabled } from './utils/soundEffects';
import { Gift, X } from 'lucide-react';

// Mock Leaderboard Data
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "রাহিম শেখ", score: 2850, prize: "৳৫০০" },
  { rank: 2, name: "নাবিলা ইসলাম", score: 2790, prize: "৳৩০০" },
  { rank: 3, name: "করিম উদ্দিন", score: 2650, prize: "৳২০০" },
  { rank: 4, name: "শফিক আহমেদ", score: 2500, prize: "৳১০০" },
  { rank: 5, name: "তানিয়া আক্তার", score: 2450, prize: "৳১০০" },
];

// Constants
const FREE_GAME_LIMIT = 3; 
const PREMIUM_GAME_LIMIT = 30;
const PREMIUM_COST_MONTHLY = 99; // Changed to 99 Taka
const DAILY_BONUS_AMOUNT = 0.50;

// Earnings Logic:
const EARNING_RATE_FREE = 0.33;
const EARNING_RATE_PREMIUM = 0.93;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // Track Admin state
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  
  const [stats, setStats] = useState<UserStats | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isQuestionsReady, setIsQuestionsReady] = useState(false);
  const [dailyBonusPopup, setDailyBonusPopup] = useState(false);

  // Initial Auth Check and Subscription Validation
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
        let currentStats = user.stats;

        // Check Subscription Expiry
        if (currentStats.isPremium && currentStats.subscriptionExpiry) {
            const expiryDate = new Date(currentStats.subscriptionExpiry);
            const now = new Date();
            
            if (now > expiryDate) {
                // Subscription Expired
                alert("আপনার মাসিক সাবস্ক্রিপশনের মেয়াদ শেষ হয়েছে। প্রিমিয়াম সুবিধা পেতে আবার সাবস্ক্রাইব করুন।");
                currentStats = {
                    ...currentStats,
                    isPremium: false,
                    subscriptionExpiry: null,
                    maxDailyGames: 3 // Revert to free limit
                };
                authService.updateUserStats(currentStats);
            }
        }

        setCurrentUser(user);
        setStats(currentStats);
        setSoundEnabled(currentStats.soundEnabled);
        loadNewQuestions();
        checkDailyBonus(currentStats);
    } else {
        setCurrentView(AppView.AUTH);
    }
  }, []);

  // Sync Stats to LocalStorage whenever they change
  useEffect(() => {
    if (stats && currentUser) {
        authService.updateUserStats(stats);
    }
  }, [stats]);

  const checkDailyBonus = (currentStats: UserStats) => {
    const today = new Date().toISOString().split('T')[0];
    if (currentStats.lastBonusDate !== today) {
        setTimeout(() => setDailyBonusPopup(true), 1500);
    }
  };

  const handleLoginSuccess = (userOrAdmin: any) => {
    // Check if it's admin
    if (userOrAdmin.isAdmin === true) {
        setIsAdmin(true);
        setCurrentView(AppView.ADMIN);
        return;
    }

    // Normal User Login
    const user = userOrAdmin as User;
    
    // Re-check subscription on login
    let userStats = user.stats;
    if (userStats.isPremium && userStats.subscriptionExpiry) {
        if (new Date() > new Date(userStats.subscriptionExpiry)) {
             userStats = { ...userStats, isPremium: false, subscriptionExpiry: null, maxDailyGames: 3 };
             authService.updateUserStats(userStats);
        }
    }

    setCurrentUser(user);
    setStats(userStats);
    setSoundEnabled(userStats.soundEnabled);
    setCurrentView(AppView.HOME);
    loadNewQuestions();
    checkDailyBonus(userStats);
  };

  const handleLogout = () => {
    const confirm = window.confirm("আপনি কি লগআউট করতে চান?");
    if (confirm) {
        authService.logout();
        setCurrentUser(null);
        setStats(null);
        setIsAdmin(false);
        setCurrentView(AppView.AUTH);
    }
  };

  const claimDailyBonus = () => {
    if (!stats) return;
    const today = new Date().toISOString().split('T')[0];
    setStats(prev => prev ? ({
        ...prev,
        balance: prev.balance + DAILY_BONUS_AMOUNT,
        lastBonusDate: today
    }) : null);
    setDailyBonusPopup(false);
  };

  const toggleSound = () => {
      if (!stats) return;
      const newStatus = !stats.soundEnabled;
      setStats(prev => prev ? ({ ...prev, soundEnabled: newStatus }) : null);
      setSoundEnabled(newStatus);
  };

  const loadNewQuestions = async () => {
    setIsQuestionsReady(false);
    const qs = await generateQuizQuestions(10);
    setQuestions(qs);
    setIsQuestionsReady(true);
  };

  const startGame = () => {
    if (stats && stats.gamesPlayedToday < stats.maxDailyGames) {
      if (isQuestionsReady) {
        setCurrentView(AppView.GAME);
      }
    } else {
      alert("আজকের খেলার লিমিট শেষ!");
    }
  };

  const checkAchievements = (currentStats: UserStats, sessionCorrect: number, sessionStreak: number) => {
      const newAchievements = currentStats.achievements.map(ach => {
          if (ach.unlocked) return ach;
          
          if (ach.id === '1' && currentStats.completedQuestions > 0) return { ...ach, unlocked: true };
          if (ach.id === '2' && sessionStreak >= 10) return { ...ach, unlocked: true };
          if (ach.id === '3' && currentStats.balance >= 50) return { ...ach, unlocked: true };
          
          return ach;
      });
      return newAchievements;
  };

  const handleGameEnd = (result: GameResult) => {
    if (!stats) return;
    const earnedMoney = result.correctCount * (stats.isPremium ? EARNING_RATE_PREMIUM : EARNING_RATE_FREE);
    
    setStats(prev => {
        if (!prev) return null;
        const updatedStreak = Math.max(prev.highestStreak, result.score > 0 ? result.correctCount : 0);
        const updatedStats = {
            ...prev,
            totalScore: prev.totalScore + result.score,
            balance: prev.balance + earnedMoney,
            gamesPlayedToday: prev.gamesPlayedToday + 1,
            completedQuestions: prev.completedQuestions + 10,
            highestStreak: updatedStreak
        };
        
        updatedStats.achievements = checkAchievements(updatedStats, result.correctCount, result.correctCount);
        return updatedStats;
    });
    
    setCurrentView(AppView.HOME);
    
    if (stats.gamesPlayedToday + 1 < stats.maxDailyGames) {
      loadNewQuestions();
    }
    
    setTimeout(() => {
      alert(`খেলা শেষ!\nস্কোর: ${result.score}\nসঠিক উত্তর: ${result.correctCount}টি\nআয়: ৳${earnedMoney.toFixed(2)}`);
    }, 200);
  };

  const handleBuyPremiumRequest = (paymentDetails: any) => {
      if (!currentUser) return;
      
      // Create Deposit Request instead of instant activation
      adminService.createDepositRequest(
          currentUser.mobile,
          currentUser.name,
          paymentDetails.method,
          paymentDetails.sender,
          paymentDetails.trxId
      );
      
      alert("আপনার পেমেন্ট ভেরিফিকেশনের জন্য জমা হয়েছে। অ্যাডমিন চেক করে শীঘ্রই প্রিমিয়াম চালু করে দিবেন।");
  };

  const handleWithdrawRequest = (amount: number, method: string, number: string) => {
    if (!currentUser) return;

    // Deduct balance locally immediately (prevent double spending)
    setStats(prev => prev ? ({
        ...prev,
        balance: prev.balance - amount
    }) : null);

    // Create withdrawal request for admin
    adminService.createWithdrawalRequest(
        currentUser.mobile,
        currentUser.name,
        amount,
        method,
        number
    );
  };

  // Render Admin View
  if (currentView === AppView.ADMIN && isAdmin) {
      return <AdminDashboard onLogout={handleLogout} />;
  }

  // Render Login/Register if no user
  if (!currentUser || !stats) {
      return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
             <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"></div>
            </div>
            <Auth onLoginSuccess={handleLoginSuccess} />
        </div>
      );
  }

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
          <Welcome 
            onStart={startGame}
            onShowLeaderboard={() => setCurrentView(AppView.LEADERBOARD)}
            onShowRules={() => setCurrentView(AppView.RULES)}
            onShowWallet={() => setCurrentView(AppView.WALLET)}
            onShowProfile={() => setCurrentView(AppView.PROFILE)}
            stats={stats}
            isQuestionsReady={isQuestionsReady}
          />
        );
      case AppView.GAME:
        return (
          <QuizGame 
            questions={questions}
            onEndGame={handleGameEnd}
            onExit={() => setCurrentView(AppView.HOME)}
          />
        );
      case AppView.WALLET:
        return (
          <Wallet 
            stats={stats}
            onBack={() => setCurrentView(AppView.HOME)}
            onBuyPremium={handleBuyPremiumRequest} // Changed handler
            onWithdraw={handleWithdrawRequest} // Changed handler
          />
        );
      case AppView.PROFILE:
        return (
          <Profile 
            user={currentUser}
            stats={stats}
            onBack={() => setCurrentView(AppView.HOME)}
            onToggleSound={toggleSound}
            onLogout={handleLogout}
          />
        );
      case AppView.LEADERBOARD:
      case AppView.RULES:
        return (
          <Leaderboard 
            entries={MOCK_LEADERBOARD}
            onBack={() => setCurrentView(AppView.HOME)}
            view={currentView}
          />
        );
      default:
        return <div>Error</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black text-white font-sans selection:bg-purple-500 selection:text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div 
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 cursor-pointer"
            onClick={() => setCurrentView(AppView.HOME)}
          >
            DhanDhan Quiz
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
             <div 
                className="hidden sm:flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full cursor-pointer hover:bg-white/10"
                onClick={() => setCurrentView(AppView.WALLET)}
             >
                <span className="text-gray-400">ব্যালেন্স:</span>
                <span className="text-green-400 font-bold">৳{stats.balance.toFixed(2)}</span>
             </div>
             <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                <span className="text-gray-300">রাউন্ড:</span>
                <span className={stats.gamesPlayedToday >= stats.maxDailyGames ? 'text-red-400' : 'text-green-400'}>
                    {stats.gamesPlayedToday}/{stats.maxDailyGames}
                </span>
             </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Daily Bonus Modal */}
      {dailyBonusPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800 border border-yellow-500/50 rounded-2xl p-8 max-w-sm w-full text-center relative shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                <button 
                    onClick={() => setDailyBonusPopup(false)}
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Gift size={40} className="text-yellow-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">ডেইলি বোনাস!</h2>
                <p className="text-gray-300 mb-6">প্রতিদিন লগইন করার জন্য আপনি পাচ্ছেন ফ্রি বোনাস।</p>
                
                <div className="text-4xl font-bold text-yellow-400 mb-6">৳{DAILY_BONUS_AMOUNT.toFixed(2)}</div>
                
                <button 
                    onClick={claimDailyBonus}
                    className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:scale-105 transition-transform"
                >
                    সংগ্রহ করুন
                </button>
            </div>
        </div>
      )}

      <footer className="relative z-10 border-t border-white/5 bg-black/20 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 DhanDhan Quiz. সকল অধিকার সংরক্ষিত।</p>
          <p className="mt-1 text-xs">AI দ্বারা পরিচালিত • বাংলা কুইজ</p>
        </div>
      </footer>
    </div>
  );
};

export default App;