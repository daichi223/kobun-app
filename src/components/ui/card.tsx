import React from "react";

export function Card({ className = "", ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`bg-white border border-secondary-200 rounded-2xl shadow-soft hover:shadow-medium transition-shadow duration-200 ${className}`} 
      {...p} 
    />
  );
}

export function CardHeader({ className = "", ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`px-6 py-4 border-b border-secondary-100 bg-surface-50/50 rounded-t-2xl ${className}`} 
      {...p} 
    />
  );
}

export function CardTitle({ className = "", ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <h3 
      className={`text-lg font-semibold text-secondary-900 leading-tight ${className}`} 
      {...p} 
    />
  );
}

export function CardContent({ className = "", ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`px-6 py-5 ${className}`} 
      {...p} 
    />
  );
}
