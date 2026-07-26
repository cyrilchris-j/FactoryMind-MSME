import { cn, getStatusColor, getPriorityColor, getSeverityColor } from '@/lib/utils';

export function Badge({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) {
  const colorClass = variant ? (getStatusColor(variant) || getPriorityColor(variant) || getSeverityColor(variant)) : 'text-secondary bg-secondary/10';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize', colorClass, className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={status}>{status.replace('_', ' ')}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge variant={priority}>{priority}</Badge>;
}

export function SeverityBadge({ severity }: { severity: string }) {
  return <Badge variant={severity}>{severity}</Badge>;
}
