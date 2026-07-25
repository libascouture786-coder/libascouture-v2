import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-24 right-5 z-[89] flex h-11 w-11 items-center justify-center rounded-full border border-gold-200 bg-ivory-100 text-navy-900 shadow-soft-md transition-all duration-luxury ease-luxury hover:border-gold-400 hover:text-gold-700 md:bottom-28 md:right-7 ${
        visible ? 'opacity-100 translate-y-0' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <ArrowUp size={18} strokeWidth={1.5} />
    </button>
  );
}
