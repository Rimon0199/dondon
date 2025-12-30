import { User, UserStats } from '../types';

const USERS_KEY = 'dhandhan_users_db';
const CURRENT_USER_KEY = 'dhandhan_current_session';

const DEFAULT_STATS: UserStats = {
    totalScore: 0,
    balance: 0.00,
    isPremium: false,
    subscriptionExpiry: null, // Default no subscription
    gamesPlayedToday: 0,
    maxDailyGames: 3, // Default free limit
    completedQuestions: 0,
    highestStreak: 0,
    lastBonusDate: null,
    referralCode: "", // Will be generated
    referralCount: 0,
    referralEarnings: 0,
    soundEnabled: true,
    achievements: [
        { id: '1', title: 'নতুন যাত্রী', description: 'প্রথম গেম সম্পন্ন করেছেন', icon: '🐣', unlocked: false },
        { id: '2', title: 'শার্প শুটার', description: 'টানা ১০টি সঠিক উত্তর', icon: '🎯', unlocked: false },
        { id: '3', title: 'বড়লোক', description: '৫০ টাকা আয় করেছেন', icon: '💰', unlocked: false }
    ]
};

// Helper to get all users
export const getUsers = (): Record<string, User> => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : {};
};

// Helper to save users
export const saveUsers = (users: Record<string, User>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authService = {
    isAdmin: (mobile: string, pin: string) => {
        return mobile === 'admin' && pin === 'admin123';
    },

    register: (name: string, mobile: string, pin: string): { success: boolean; message: string; user?: User } => {
        const users = getUsers();
        
        if (users[mobile]) {
            return { success: false, message: 'এই মোবাইল নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।' };
        }

        const newUser: User = {
            name,
            mobile,
            password: pin,
            stats: {
                ...DEFAULT_STATS,
                referralCode: "DHAN" + Math.floor(Math.random() * 9000 + 1000)
            }
        };

        users[mobile] = newUser;
        saveUsers(users);
        
        // Auto login
        localStorage.setItem(CURRENT_USER_KEY, mobile);
        return { success: true, message: 'রেজিস্ট্রেশন সফল হয়েছে!', user: newUser };
    },

    login: (mobile: string, pin: string): { success: boolean; message: string; user?: User; isAdmin?: boolean } => {
        // Check for Admin
        if (mobile === 'admin' && pin === 'admin123') {
            return { success: true, message: 'অ্যাডমিন প্যানেলে স্বাগতম', isAdmin: true };
        }

        const users = getUsers();
        const user = users[mobile];

        if (!user) {
            return { success: false, message: 'অ্যাকাউন্ট পাওয়া যায়নি। আগে রেজিস্ট্রেশন করুন।' };
        }

        if (user.password !== pin) {
            return { success: false, message: 'ভুল পিন দিয়েছেন।' };
        }

        localStorage.setItem(CURRENT_USER_KEY, mobile);
        return { success: true, message: 'লগইন সফল!', user };
    },

    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    getCurrentUser: (): User | null => {
        const mobile = localStorage.getItem(CURRENT_USER_KEY);
        if (!mobile) return null;
        
        const users = getUsers();
        return users[mobile] || null;
    },

    updateUserStats: (newStats: UserStats) => {
        const mobile = localStorage.getItem(CURRENT_USER_KEY);
        if (!mobile) return;

        const users = getUsers();
        if (users[mobile]) {
            users[mobile].stats = newStats;
            saveUsers(users);
        }
    }
};