import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-IN');
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    running: 'text-accent bg-accent/10',
    idle: 'text-secondary bg-secondary/10',
    maintenance: 'text-warning bg-warning/10',
    offline: 'text-danger bg-danger/10',
    pending: 'text-secondary bg-secondary/10',
    in_progress: 'text-primary bg-primary/10',
    completed: 'text-accent bg-accent/10',
    delayed: 'text-danger bg-danger/10',
    present: 'text-accent bg-accent/10',
    absent: 'text-danger bg-danger/10',
    leave: 'text-warning bg-warning/10',
  };
  return colors[status] || 'text-secondary bg-secondary/10';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'text-secondary bg-secondary/10',
    medium: 'text-primary bg-primary/10',
    high: 'text-warning bg-warning/10',
    critical: 'text-danger bg-danger/10',
  };
  return colors[priority] || 'text-secondary bg-secondary/10';
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    info: 'text-primary bg-primary/10',
    warning: 'text-warning bg-warning/10',
    critical: 'text-danger bg-danger/10',
  };
  return colors[severity] || 'text-secondary bg-secondary/10';
}
