import React from "react";

type ProgressProps = {
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
};

export function Progress({ 
  value = 0, 
  max = 100, 
  size = "md", 
  variant = "default",
  showLabel = false,
  animated = true,
  className = ""
}: ProgressProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  
  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4"
  };
  
  const variantStyles = {
    default: "bg-primary-600",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500"
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-secondary-700">Progress</span>
          <span className="text-sm text-secondary-500">{Math.round(percentage)}%</span>
        </div>
      )}
      <div 
        className={`w-full bg-secondary-200 rounded-full overflow-hidden ${sizeStyles[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        aria-valuemin={0}
      >
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${variantStyles[variant]} ${
            animated ? 'animate-progress' : ''
          }`}
          style={{ 
            width: `${percentage}%`,
            transformOrigin: 'left center'
          }}
        />
      </div>
    </div>
  );
}
