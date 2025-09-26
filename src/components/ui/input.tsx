import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export function Input({
  className = "",
  label,
  error,
  size = "md",
  leftIcon,
  rightIcon,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-3 py-2.5 text-sm",
    lg: "px-4 py-3 text-base"
  };

  const baseStyles = `
    w-full
    bg-white
    border
    rounded-xl
    shadow-sm
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-primary-500
    focus:border-primary-500
    focus:ring-offset-2
    placeholder:text-secondary-400
    ${error ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : 'border-secondary-300 hover:border-secondary-400'}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
  `;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-secondary-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`${baseStyles} ${sizeStyles[size]} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-1.5 text-sm text-danger-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
