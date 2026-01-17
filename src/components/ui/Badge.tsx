interface BadgeProps {
  variant?: 'pending' | 'processing' | 'ready' | 'rejected' | 'default';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  ready: 'bg-green-500/20 text-green-300 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const labels: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  ready: 'Listo',
  rejected: 'Rechazado',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variant = status as BadgeProps['variant'];
  return <Badge variant={variant}>{labels[status] || status}</Badge>;
}
