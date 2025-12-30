export interface Question {
  id: string; // Changed to string for hash/unique ID
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  unlocked: boolean;
}

export interface UserStats {
  totalScore: number;
  balance: number; // In Taka
  isPremium: boolean;
  subscriptionExpiry: string | null; // ISO Date string for monthly subscription
  gamesPlayedToday: number;
  maxDailyGames: number;
  completedQuestions: number;
  highestStreak: number;
  lastBonusDate: string | null; // ISO Date string
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  soundEnabled: boolean;
  achievements: Achievement[];
}

// New User Interface
export interface User {
  mobile: string;
  password: string; // In real app, this should be hashed
  name: string;
  stats: UserStats;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  prize: string;
}

export enum AppView {
  AUTH = 'AUTH',
  HOME = 'HOME',
  GAME = 'GAME',
  LEADERBOARD = 'LEADERBOARD',
  RULES = 'RULES',
  WALLET = 'WALLET',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN' // Added Admin View
}

export enum GameStatus {
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}

export interface LifelineState {
  fiftyFiftyUsed: boolean;
  timeFreezeUsed: boolean;
}

export interface GameResult {
  score: number;
  correctCount: number;
}

// Admin & Transaction Types
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DepositRequest {
  id: string;
  userId: string; // Mobile number
  userName: string;
  method: string;
  senderNumber: string;
  trxId: string;
  amount: number;
  date: string;
  status: TransactionStatus;
}

export interface WithdrawalRequest {
  id: string;
  userId: string; // Mobile number
  userName: string;
  method: string;
  receiverNumber: string;
  amount: number;
  date: string;
  status: TransactionStatus;
}