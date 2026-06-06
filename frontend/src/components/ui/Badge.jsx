const variants = {
  default:   'bg-surface-100 text-ink-700',
  success:   'bg-green-50 text-green-700',
  warning:   'bg-yellow-50 text-yellow-700',
  danger:    'bg-red-50 text-red-600',
  info:      'bg-brand-50 text-brand-700',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}