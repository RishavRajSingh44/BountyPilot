// Adapted from shadcn/ui's MIT-licensed Button; see THIRD_PARTY_NOTICES.md.
import type { ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
export const buttonVariants = cva('button', {
  variants: {
    variant: {
      default: 'button-primary',
      outline: 'button-outline',
      ghost: 'button-ghost',
      destructive: 'button-destructive'
    },
    size: { default: '', icon: 'button-icon', sm: 'button-sm' }
  },
  defaultVariants: { variant: 'default', size: 'default' }
});
export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
