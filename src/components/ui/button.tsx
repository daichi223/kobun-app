import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "secondary" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
};

export function Button({ 
  className = "", 
  variant = "default", 
  size = "md",
  isLoading = false,
  disabled,
  children,
  ...props 
}: Props) {
  const baseStyles = "inline-flex items-center justify-center font-text font-medium transition-all duration-apple-fast ease-apple-ease focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transform-gpu select-none touch-manipulation";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm rounded-lg min-h-[32px]",
    md: "px-4 py-2.5 text-sm rounded-xl min-h-[40px]",
    lg: "px-6 py-3 text-base rounded-xl min-h-[48px]" // Meets Apple's 44pt minimum touch target
  };
  
  const variantStyles = {
    default: "bg-primary-600 text-white border border-transparent hover:bg-primary-700 focus-visible:ring-primary-500 active:bg-primary-800 shadow-apple-button hover:shadow-apple active:shadow-sm",
    outline: "bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50 focus-visible:ring-primary-500 hover:border-secondary-400 shadow-apple-button hover:shadow-apple",
    secondary: "bg-secondary-100 text-secondary-700 border border-transparent hover:bg-secondary-200 focus-visible:ring-secondary-500 shadow-apple-button hover:shadow-apple",
    success: "bg-success-600 text-white border border-transparent hover:bg-success-700 focus-visible:ring-success-500 shadow-apple-button hover:shadow-apple active:shadow-sm",
    danger: "bg-danger-600 text-white border border-transparent hover:bg-danger-700 focus-visible:ring-danger-500 shadow-apple-button hover:shadow-apple active:shadow-sm",
    ghost: "text-secondary-600 border border-transparent hover:bg-secondary-100 focus-visible:ring-secondary-500 hover:shadow-apple-button"
  };

  const isDisabled = disabled || isLoading;

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} 
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
