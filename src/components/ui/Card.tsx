import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'li';
  onClick?: () => void;
};

export function Card({ children, className = '', as = 'div', onClick }: CardProps) {
  const Tag = as;
  return (
    <Tag className={`card-luxury ${className}`} onClick={onClick}>
      {children}
    </Tag>
  );
}
