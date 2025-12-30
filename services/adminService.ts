import { DepositRequest, WithdrawalRequest, TransactionStatus } from "../types";
import { getUsers, saveUsers } from "./authService";

const DEPOSITS_KEY = 'dhandhan_deposits_db';
const WITHDRAWALS_KEY = 'dhandhan_withdrawals_db';

const getDeposits = (): DepositRequest[] => {
    const stored = localStorage.getItem(DEPOSITS_KEY);
    return stored ? JSON.parse(stored) : [];
};

const getWithdrawals = (): WithdrawalRequest[] => {
    const stored = localStorage.getItem(WITHDRAWALS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const adminService = {
    // --- Deposit (Premium) Logic ---
    createDepositRequest: (userId: string, userName: string, method: string, sender: string, trxId: string) => {
        const deposits = getDeposits();
        const newReq: DepositRequest = {
            id: Date.now().toString(),
            userId,
            userName,
            method,
            senderNumber: sender,
            trxId,
            amount: 99,
            date: new Date().toISOString(),
            status: 'PENDING'
        };
        deposits.unshift(newReq); // Add to top
        localStorage.setItem(DEPOSITS_KEY, JSON.stringify(deposits));
    },

    getAllDeposits: () => getDeposits(),

    approveDeposit: (reqId: string) => {
        const deposits = getDeposits();
        const reqIndex = deposits.findIndex(r => r.id === reqId);
        if (reqIndex === -1) return;

        const req = deposits[reqIndex];
        if (req.status !== 'PENDING') return;

        // 1. Update Request Status
        deposits[reqIndex].status = 'APPROVED';
        localStorage.setItem(DEPOSITS_KEY, JSON.stringify(deposits));

        // 2. Grant Premium to User
        const users = getUsers();
        if (users[req.userId]) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            
            users[req.userId].stats.isPremium = true;
            users[req.userId].stats.maxDailyGames = 30; // Premium Limit
            users[req.userId].stats.subscriptionExpiry = expiryDate.toISOString();
            
            saveUsers(users);
        }
    },

    rejectDeposit: (reqId: string) => {
        const deposits = getDeposits();
        const req = deposits.find(r => r.id === reqId);
        if (req && req.status === 'PENDING') {
            req.status = 'REJECTED';
            localStorage.setItem(DEPOSITS_KEY, JSON.stringify(deposits));
        }
    },

    // --- Withdrawal Logic ---
    createWithdrawalRequest: (userId: string, userName: string, amount: number, method: string, receiver: string) => {
        const withdrawals = getWithdrawals();
        const newReq: WithdrawalRequest = {
            id: Date.now().toString(),
            userId,
            userName,
            method,
            receiverNumber: receiver,
            amount,
            date: new Date().toISOString(),
            status: 'PENDING'
        };
        withdrawals.unshift(newReq);
        localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(withdrawals));
        
        // Note: Balance is deducted in UI immediately, but if rejected we refund.
    },

    getAllWithdrawals: () => getWithdrawals(),

    approveWithdrawal: (reqId: string) => {
        const withdrawals = getWithdrawals();
        const req = withdrawals.find(r => r.id === reqId);
        if (req && req.status === 'PENDING') {
            req.status = 'APPROVED';
            localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(withdrawals));
        }
    },

    rejectWithdrawal: (reqId: string) => {
        const withdrawals = getWithdrawals();
        const reqIndex = withdrawals.findIndex(r => r.id === reqId);
        if (reqIndex === -1) return;
        
        const req = withdrawals[reqIndex];
        if (req.status !== 'PENDING') return;

        // 1. Update Status
        withdrawals[reqIndex].status = 'REJECTED';
        localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(withdrawals));

        // 2. Refund User Balance
        const users = getUsers();
        if (users[req.userId]) {
            users[req.userId].stats.balance += req.amount;
            saveUsers(users);
        }
    },

    // --- Stats ---
    getAllUsers: () => Object.values(getUsers()),
    
    getDashboardStats: () => {
        const users = Object.values(getUsers());
        const withdrawals = getWithdrawals();
        const deposits = getDeposits();

        const totalUsers = users.length;
        const totalUserBalance = users.reduce((sum, u) => sum + u.stats.balance, 0);
        const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING').length;
        const pendingDeposits = deposits.filter(d => d.status === 'PENDING').length;
        const totalPremiumUsers = users.filter(u => u.stats.isPremium).length;

        return {
            totalUsers,
            totalUserBalance,
            pendingWithdrawals,
            pendingDeposits,
            totalPremiumUsers
        };
    }
};