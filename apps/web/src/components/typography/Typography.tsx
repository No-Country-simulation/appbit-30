import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function H1({ children, className }: TypographyProps) {
  return <h1 className={cn('ds-h1', className)}>{children}</h1>;
}

export function H2({ children, className }: TypographyProps) {
  return <h2 className={cn('ds-h2', className)}>{children}</h2>;
}

export function H3({ children, className }: TypographyProps) {
  return <h3 className={cn('ds-h3', className)}>{children}</h3>;
}

export function Body({ children, className }: TypographyProps) {
  return <p className={cn('ds-body', className)}>{children}</p>;
}

export function BodyMedium({ children, className }: TypographyProps) {
  return <p className={cn('ds-body-medium', className)}>{children}</p>;
}

export function BodySemibold({ children, className }: TypographyProps) {
  return <p className={cn('ds-body-semibold', className)}>{children}</p>;
}

export function Caption({ children, className }: TypographyProps) {
  return <span className={cn('ds-caption', className)}>{children}</span>;
}
