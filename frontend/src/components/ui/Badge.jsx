const variants = {
  default:   'bg-surface-100 text-ink-700',
  success:   'bg-emerald-50 text-emerald-700',
  warning:   'bg-amber-50 text-amber-700',
  danger:    'bg-red-50 text-red-700',
  info:      'bg-brand-50 text-brand-700',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
