import React, { useState, useEffect } from 'react';
import { Question, GameStatus, LifelineState, GameResult } from '../types';
import { Button } from './Button';
import { Clock, CheckCircle2, XCircle, AlertCircle, Zap, ShieldHalf, Timer, Flag } from 'lucide-react';
import { 
  playCorrectSound, 
  playWrongSound, 
  playTickSound, 
  playLifelineSound, 
  playTimeoutSound 
} from '../utils/soundEffects';

interface QuizGameProps {
  questions: Question[];
  onEndGame: (result: GameResult) => void;
  onExit: () => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ questions: initialQuestions, onEndGame, onExit }) => {
  const [questions] = useState<Question[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12); // Reduced time for Hard Mode
  const [showResult, setShowResult] = useState(false);
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [reported, setReported] = useState(false);
  
  // New Features State
  const [streak, setStreak] = useState(0);
  const [lifelines, setLifelines] = useState<LifelineState>({ fiftyFiftyUsed: false, timeFreezeUsed: false });
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]); // Indexes to hide for 50/50

  const POINTS_PER_QUESTION = 10;
  const STREAK_BONUS = 5;
  const PENALTY = 5; // Negative marking

  // Timer logic
  useEffect(() => {
    if (status !== GameStatus.PLAYING || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        // Play tick sound for every second
        playTickSound();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, showResult, currentIndex]);

  const handleTimeUp = () => {
    playTimeoutSound();
    setStreak(0); // Reset streak on timeout
    setShowResult(true);
    setTimeout(nextQuestion, 2000);
  };

  const handleOptionClick = (index: number) => {
    if (showResult) return;
    
    setSelectedOption(index);
    setShowResult(true);

    const isCorrect = index === questions[currentIndex].correctAnswerIndex;

    if (isCorrect) {
      playCorrectSound();
      const bonus = Math.floor(streak / 2) * STREAK_BONUS; // Bonus every 2 streaks
      setScore(s => s + POINTS_PER_QUESTION + bonus);
      setCorrectCount(c => c + 1);
      setStreak(s => s + 1);
    } else {
      playWrongSound();
      setScore(s => Math.max(0, s - PENALTY)); // Penalty for wrong answer
      setStreak(0);
    }

    setTimeout(nextQuestion, 2000);
  };

  // Lifeline: 50/50
  const useFiftyFifty = () => {
    if (lifelines.fiftyFiftyUsed || showResult) return;
    
    playLifelineSound();
    
    const correctIndex = questions[currentIndex].correctAnswerIndex;
    const wrongIndices = questions[currentIndex].options
      .map((_, idx) => idx)
      .filter(idx => idx !== correctIndex);
    
    // Randomly select 2 wrong options to hide
    const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
    const toHide = shuffled.slice(0, 2);
    
    setHiddenOptions(toHide);
    setLifelines(prev => ({ ...prev, fiftyFiftyUsed: true }));
  };

  // Lifeline: +10 Seconds
  const useTimeBonus = () => {
    if (lifelines.timeFreezeUsed || showResult) return;
    
    playLifelineSound();
    setTimeLeft(prev => prev + 10);
    setLifelines(prev => ({ ...prev, timeFreezeUsed: true }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setTimeLeft(12); // Reset time
      setHiddenOptions([]); // Reset 50/50
      setReported(false);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setStatus(GameStatus.FINISHED);
    setTimeout(() => {
        onEndGame({ score, correctCount });
    }, 500);
  };

  const handleReport = () => {
    setReported(true);
    // In real app, send API call
    alert("প্রশ্নটি রিপোর্টের জন্য মার্ক করা হয়েছে। ধন্যবাদ!");
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-red-400">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-xl">কোনো প্রশ্ন পাওয়া যায়নি।</p>
        <Button onClick={onExit} variant="secondary" className="mt-4">ফিরে যান</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto p-4 animate-fade-in relative">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-4 bg-white/5 p-4 rounded-xl backdrop-blur-md border border-white/10 shadow-xl">
        <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase tracking-wider">প্রশ্ন</span>
            <span className="text-white font-bold text-xl">{currentIndex + 1}<span className="text-gray-500 text-sm">/{questions.length}</span></span>
        </div>
        
        {/* Timer */}
        <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 ${timeLeft < 5 ? 'border-red-500 bg-red-500/10 animate-pulse' : 'border-yellow-400 bg-yellow-400/10'}`}>
            <span className={`font-bold text-xl ${timeLeft < 5 ? 'text-red-400' : 'text-yellow-400'}`}>{timeLeft}</span>
        </div>

        <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400 uppercase tracking-wider">স্কোর</span>
            <span className="text-green-400 font-bold text-xl">{score}</span>
        </div>
      </div>

      {/* Streak Indicator */}
      {streak > 1 && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce flex items-center gap-1 z-20">
            <Zap size={12} fill="currentColor" /> {streak}x স্ট্রিক বোনাস!
        </div>
      )}

      {/* Question Card */}
      <div className="mb-6 mt-4 relative">
        <button 
            onClick={handleReport}
            disabled={reported}
            className={`absolute top-0 right-0 p-2 rounded-full hover:bg-white/10 transition-colors ${reported ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
            title="ভুল প্রশ্ন রিপোর্ট করুন"
        >
            <Flag size={16} fill={reported ? "currentColor" : "none"} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-center text-white drop-shadow-sm min-h-[80px] flex items-center justify-center pt-6 px-2">
          {currentQuestion.question}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {currentQuestion.options.map((option, idx) => {
          const isHidden = hiddenOptions.includes(idx);
          if (isHidden) {
              return <div key={idx} className="h-[60px] invisible"></div>; // Placeholder to keep layout
          }

          let optionClass = "bg-slate-800/50 hover:bg-slate-700/80 border-slate-600/50"; // Default Hard Theme
          
          if (showResult) {
            if (idx === currentQuestion.correctAnswerIndex) {
              optionClass = "bg-green-600 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] transform scale-[1.02]";
            } else if (idx === selectedOption) {
              optionClass = "bg-red-600 border-red-400 text-white shake";
            } else {
                optionClass = "bg-slate-900/50 opacity-40";
            }
          }

          return (
            <button
              key={idx}
              disabled={showResult}
              onClick={() => handleOptionClick(idx)}
              className={`p-4 rounded-xl text-left transition-all duration-200 border-2 ${optionClass} flex items-center justify-between group relative overflow-hidden`}
            >
              <span className="font-semibold text-lg z-10">{option}</span>
              {showResult && idx === currentQuestion.correctAnswerIndex && (
                <CheckCircle2 className="text-white z-10" size={24} />
              )}
              {showResult && idx === selectedOption && idx !== currentQuestion.correctAnswerIndex && (
                <XCircle className="text-white z-10" size={24} />
              )}
            </button>
          );
        })}
      </div>

      {/* Lifelines Footer */}
      <div className="flex gap-4 justify-center mt-6">
          <button 
            onClick={useFiftyFifty}
            disabled={lifelines.fiftyFiftyUsed || showResult}
            className={`flex flex-col items-center gap-1 transition-all ${lifelines.fiftyFiftyUsed ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg border-2 border-white/20">
                <ShieldHalf className="text-white" size={20} />
            </div>
            <span className="text-xs font-bold text-cyan-300">৫০/৫০</span>
          </button>

          <button 
            onClick={useTimeBonus}
            disabled={lifelines.timeFreezeUsed || showResult}
            className={`flex flex-col items-center gap-1 transition-all ${lifelines.timeFreezeUsed ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg border-2 border-white/20">
                <Timer className="text-white" size={20} />
            </div>
            <span className="text-xs font-bold text-pink-300">+সময়</span>
          </button>
      </div>
      
      <div className="mt-8 flex justify-center">
        <Button onClick={onExit} variant="ghost" className="text-xs text-gray-500 hover:text-red-400">
            খেলা ত্যাগ করুন
        </Button>
      </div>
      
      <style>{`
        .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};