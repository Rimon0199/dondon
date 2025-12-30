import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Button } from './Button';
import { Users, DollarSign, ArrowDownToLine, ArrowUpFromLine, Check, X, Search, Activity, LogOut } from 'lucide-react';
import { User, DepositRequest, WithdrawalRequest } from '../types';

interface AdminDashboardProps {
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'deposits' | 'withdrawals'>('overview');
    const [stats, setStats] = useState(adminService.getDashboardStats());
    const [users, setUsers] = useState<User[]>([]);
    const [deposits, setDeposits] = useState<DepositRequest[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

    useEffect(() => {
        refreshData();
    }, [activeTab]);

    const refreshData = () => {
        setStats(adminService.getDashboardStats());
        setUsers(adminService.getAllUsers());
        setDeposits(adminService.getAllDeposits());
        setWithdrawals(adminService.getAllWithdrawals());
    };

    const handleApproveDeposit = (id: string) => {
        if(confirm("আপনি কি নিশ্চিত এই পেমেন্ট Approve করবেন?")) {
            adminService.approveDeposit(id);
            refreshData();
        }
    };

    const handleRejectDeposit = (id: string) => {
        if(confirm("আপনি কি নিশ্চিত এই পেমেন্ট Reject করবেন?")) {
            adminService.rejectDeposit(id);
            refreshData();
        }
    };

    const handleApproveWithdrawal = (id: string) => {
         if(confirm("আপনি কি টাকা পাঠিয়েছেন? Status Approve করা হবে।")) {
            adminService.approveWithdrawal(id);
            refreshData();
        }
    };

    const handleRejectWithdrawal = (id: string) => {
         if(confirm("রিজেক্ট করলে টাকা ইউজারের ব্যালেন্সে ফেরত যাবে। নিশ্চিত?")) {
            adminService.rejectWithdrawal(id);
            refreshData();
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-xl border border-white/10">
                    <div>
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            অ্যাডমিন প্যানেল
                        </h1>
                        <p className="text-sm text-gray-400">DhanDhan Quiz Management</p>
                    </div>
                    <Button onClick={onLogout} variant="danger" className="py-2 text-sm">
                        <LogOut size={16} /> লগ আউট
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button 
                        onClick={() => setActiveTab('overview')} 
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}
                    >
                        <Activity size={18} /> ড্যাশবোর্ড
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')} 
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}
                    >
                        <Users size={18} /> ইউজার ({stats.totalUsers})
                    </button>
                    <button 
                        onClick={() => setActiveTab('deposits')} 
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'deposits' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}
                    >
                        <ArrowDownToLine size={18} /> ডিপোজিট রিকোয়েস্ট {stats.pendingDeposits > 0 && <span className="bg-red-500 text-white text-xs px-2 rounded-full">{stats.pendingDeposits}</span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('withdrawals')} 
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'withdrawals' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}
                    >
                        <ArrowUpFromLine size={18} /> উইথড্র রিকোয়েস্ট {stats.pendingWithdrawals > 0 && <span className="bg-red-500 text-white text-xs px-2 rounded-full">{stats.pendingWithdrawals}</span>}
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
                    
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-xl">
                                <p className="text-gray-400 mb-1">মোট ইউজার</p>
                                <h2 className="text-3xl font-bold text-blue-400">{stats.totalUsers}</h2>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl">
                                <p className="text-gray-400 mb-1">ইউজারদের কাছে জমা টাকা</p>
                                <h2 className="text-3xl font-bold text-green-400">৳ {stats.totalUserBalance.toFixed(2)}</h2>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl">
                                <p className="text-gray-400 mb-1">প্রিমিয়াম মেম্বার</p>
                                <h2 className="text-3xl font-bold text-yellow-400">{stats.totalPremiumUsers}</h2>
                            </div>
                             <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl">
                                <p className="text-gray-400 mb-1">পেন্ডিং উইথড্র</p>
                                <h2 className="text-3xl font-bold text-red-400">{stats.pendingWithdrawals}</h2>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-400 border-b border-white/10">
                                        <th className="p-3">নাম</th>
                                        <th className="p-3">মোবাইল</th>
                                        <th className="p-3">ব্যালেন্স</th>
                                        <th className="p-3">স্ট্যাটাস</th>
                                        <th className="p-3">কুইজ খেলেছে</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-3 font-bold">{user.name}</td>
                                            <td className="p-3 font-mono text-sm">{user.mobile}</td>
                                            <td className="p-3 text-green-400 font-bold">৳{user.stats.balance.toFixed(2)}</td>
                                            <td className="p-3">
                                                {user.stats.isPremium ? 
                                                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs border border-yellow-500/30">Premium</span> : 
                                                    <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs">Free</span>
                                                }
                                            </td>
                                            <td className="p-3 text-sm">
                                                {user.stats.completedQuestions} টি
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Deposits Tab */}
                    {activeTab === 'deposits' && (
                        <div className="space-y-4">
                            {deposits.length === 0 && <p className="text-center text-gray-500">কোনো রিকোয়েস্ট নেই</p>}
                            {deposits.map((req) => (
                                <div key={req.id} className="bg-black/20 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 border border-white/5">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white">{req.userName}</span>
                                            <span className="text-xs text-gray-400">({req.userId})</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 text-sm text-gray-300">
                                            <p>Method: <span className="text-yellow-400 uppercase">{req.method}</span></p>
                                            <p>Sender: <span className="font-mono text-white">{req.senderNumber}</span></p>
                                            <p className="col-span-2">TrxID: <span className="font-mono text-blue-300 bg-blue-500/10 px-2 rounded">{req.trxId}</span></p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(req.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {req.status === 'PENDING' ? (
                                            <>
                                                <button onClick={() => handleApproveDeposit(req.id)} className="bg-green-600 hover:bg-green-700 p-2 rounded-lg text-white" title="Approve">
                                                    <Check size={20} />
                                                </button>
                                                <button onClick={() => handleRejectDeposit(req.id)} className="bg-red-600 hover:bg-red-700 p-2 rounded-lg text-white" title="Reject">
                                                    <X size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`px-3 py-1 rounded text-xs font-bold ${req.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {req.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Withdrawals Tab */}
                    {activeTab === 'withdrawals' && (
                        <div className="space-y-4">
                            {withdrawals.length === 0 && <p className="text-center text-gray-500">কোনো রিকোয়েস্ট নেই</p>}
                            {withdrawals.map((req) => (
                                <div key={req.id} className="bg-black/20 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 border border-white/5">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white">{req.userName}</span>
                                            <span className="text-xs text-gray-400">({req.userId})</span>
                                        </div>
                                        <div className="text-2xl font-bold text-red-400 mb-2">৳{req.amount}</div>
                                        <div className="text-sm text-gray-300">
                                            <p>To: <span className="text-yellow-400 uppercase">{req.method}</span> - <span className="font-mono text-white">{req.receiverNumber}</span></p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(req.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {req.status === 'PENDING' ? (
                                            <>
                                                <button onClick={() => handleApproveWithdrawal(req.id)} className="bg-green-600 hover:bg-green-700 p-2 rounded-lg text-white" title="Mark as Paid">
                                                    <span className="text-xs font-bold">Pay</span>
                                                </button>
                                                <button onClick={() => handleRejectWithdrawal(req.id)} className="bg-red-600 hover:bg-red-700 p-2 rounded-lg text-white" title="Reject & Refund">
                                                    <X size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`px-3 py-1 rounded text-xs font-bold ${req.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {req.status === 'APPROVED' ? 'PAID' : 'REJECTED'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};