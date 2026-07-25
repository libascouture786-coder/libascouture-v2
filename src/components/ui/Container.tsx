import type { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'main' | 'article' | 'header' | 'footer';
};

export function Container({ children, className = '', as = 'div' }: ContainerProps) {
  const Tag = as;
  return <Tag className={`container-luxury ${className}`}>{children}</Tag>;
}
