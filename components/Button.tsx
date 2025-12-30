import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false,
  disabled,
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/30",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30",
    ghost: "text-gray-300 hover:text-white hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed transform-none' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};