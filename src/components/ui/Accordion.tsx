import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  defaultOpen?: string;
  className?: string;
};

export function Accordion({ items, defaultOpen, className = '' }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen ?? null);

  return (
    <div className={`divide-y divide-navy-100 ${className}`}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="accordion-trigger"
              aria-expanded={isOpen}
            >
              <span className={`text-base font-serif ${isOpen ? 'text-navy-900' : 'text-charcoal-700'}`}>
                {item.title}
              </span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-gold-600 transition-transform duration-luxury ease-luxury ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className="accordion-content"
              style={{ maxHeight: isOpen ? '500px' : '0px', opacity: isOpen ? 1 : 0 }}
            >
              <div className="pb-5 pr-8 text-sm font-light leading-relaxed text-charcoal-500">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
