import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '../../lib/cn.ts';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';
export type ButtonSize = 'md' | 'lg';

// Recipes follow DESIGN_GUIDE §12.1; `lg` is the site's pill CTA size.
const BASE =
  'pressable inline-flex shrink-0 items-center justify-center gap-2 border font-medium whitespace-nowrap select-none [&_svg]:size-4 [&_svg]:shrink-0';

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-action-gradient font-semibold text-[#fff] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.18),0_1px_2px_rgb(0_0_0_/_0.35)] hover:shadow-glow-sm hover:brightness-105 focus-visible:shadow-glow-sm active:brightness-95',
  secondary: 'border-line-strong bg-raised text-fg shadow-edge hover:border-action/60 hover:bg-overlay active:bg-sunken',
  quiet: 'border-transparent bg-transparent text-fg-secondary hover:bg-raised hover:text-fg active:bg-sunken',
};

const SIZE: Record<ButtonSize, string> = {
  md: 'min-h-10 rounded-md px-3.5 text-body',
  lg: 'min-h-12 rounded-full px-6 text-[15px]',
};

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', className?: string) {
  return cn(BASE, VARIANT[variant], SIZE[size], className);
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Button({ variant, size, icon, className, children, ...rest }: CommonProps & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>) {
  return (
    <button type="button" className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

/** Internal navigation (`to`) or external link (`href`, opens in a new tab). */
export function ButtonLink({ variant, size, icon, className, children, to, href }: CommonProps & ({ to: string; href?: never } | { href: string; to?: never })) {
  const classes = buttonClass(variant, size, className);
  if (to !== undefined)
    return (
      <Link to={to} className={classes} viewTransition>
        {icon}
        {children}
      </Link>
    );
  return (
    <a href={href} className={classes} target="_blank" rel="noreferrer">
      {icon}
      {children}
    </a>
  );
}
