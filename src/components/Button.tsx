import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "px-6 py-3 rounded-xl font-bold text-lg transition-transform active:scale-95 shadow-lg";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30",
    secondary: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/30",
    danger: "bg-red-500 hover:bg-red-400 text-white shadow-red-500/30"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
