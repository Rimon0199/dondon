import React, { useState } from 'react';
import { Button } from './Button';
import { authService } from '../services/authService';
import { User } from '../types';
import { Lock, Phone, User as UserIcon, LogIn, UserPlus, Zap, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && !acceptedTerms) {
        setError('দয়া করে শর্তাবলী এবং নিয়মগুলো মেনে নিন।');
        return;
    }

    setLoading(true);

    // Basic Validation for non-admin
    if (mobile !== 'admin') {
        if (mobile.length !== 11) {
            setError('সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন');
            setLoading(false);
            return;
        }
        if (pin.length < 4) {
            setError('পিন অন্তত ৪ সংখ্যার হতে হবে');
            setLoading(false);
            return;
        }
    }

    setTimeout(() => { // Fake network delay for feel
        let result;
        if (isLogin) {
            result = authService.login(mobile, pin);
        } else {
            if (!name) {
                setError('আপনার নাম লিখুন');
                setLoading(false);
                return;
            }
            result = authService.register(name, mobile, pin);
        }

        if (result.success) {
            if (result.isAdmin) {
                onLoginSuccess({ isAdmin: true });
            } else if (result.user) {
                onLoginSuccess(result.user);
            }
        } else {
            setError(result.message);
        }
        setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl animate-fade-in relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>

        <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 mb-4 shadow-lg shadow-indigo-500/30">
                <Zap className="text-white w-8 h-8" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                ধনধান কুইজ
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
                {isLogin ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm text-center animate-pulse">
                    {error}
                </div>
            )}

            {!isLogin && (
                <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">আপনার নাম</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="আপনার নাম"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-1">
                <label className="text-xs text-gray-400 ml-1">মোবাইল নম্বর</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="017xxxxxxxx"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs text-gray-400 ml-1">গোপন পিন/পাসওয়ার্ড</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="password" 
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="****"
                    />
                </div>
            </div>

            {/* Terms and Conditions Lock */}
            {!isLogin && (
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            id="terms"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                        />
                    </div>
                    <label htmlFor="terms" className="text-xs text-gray-300 cursor-pointer">
                        আমি <span className="text-purple-400 font-bold">শর্তাবলী</span> মেনে নিচ্ছি। আমি একমত যে একাধিক একাউন্ট খুলব না এবং নিয়ম মেনে খেলব।
                    </label>
                </div>
            )}

            <Button 
                type="submit" 
                className="w-full py-4 text-lg mt-6" 
                loading={loading}
                disabled={!isLogin && !acceptedTerms} // Button Locked here
            >
                {isLogin ? (
                    <><LogIn size={20} /> লগইন করুন</>
                ) : (
                    <><UserPlus size={20} /> রেজিস্ট্রেশন করুন</>
                )}
            </Button>
        </form>

        <div className="mt-6 text-center relative z-10">
            <p className="text-gray-400 text-sm">
                {isLogin ? "অ্যাকাউন্ট নেই?" : "ইতোমধ্যে অ্যাকাউন্ট আছে?"}
                <button 
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="ml-2 text-purple-400 font-bold hover:underline"
                >
                    {isLogin ? "রেজিস্ট্রেশন করুন" : "লগইন করুন"}
                </button>
            </p>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} /> নিরাপদ এবং সুরক্ষিত
            </div>
        </div>
      </div>
    </div>
  );
};