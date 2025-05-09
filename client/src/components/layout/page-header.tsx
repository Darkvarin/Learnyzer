import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 rounded-xl bg-background/50 border border-purple-500/20">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white/90 tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-white/60 mt-1">{description}</p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}