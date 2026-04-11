import * as React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:brightness-105 active:scale-[0.98]';

    const variants = {
      default:
        'bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20',
      destructive: 'bg-error text-on-error shadow-lg shadow-error/20',
      outline:
        'border border-outline-variant/20 bg-transparent hover:bg-surface-container-low text-on-surface',
      secondary:
        'border border-outline-variant/20 bg-transparent hover:bg-surface-container-low text-on-surface',
      ghost: 'hover:bg-surface-container-low text-on-surface',
      link: 'text-primary underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-11 px-6 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-12 rounded-md px-8',
      icon: 'h-11 w-11',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
