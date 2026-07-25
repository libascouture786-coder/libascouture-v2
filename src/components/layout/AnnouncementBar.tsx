import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { site } from '@/config/site';

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const messages = site.announcements;
    if (messages.length <= 1) return;
    const interval = window.setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div className="relative z-[96] bg-navy-900 text-ivory-100">
      <div className="container-luxury flex h-9 items-center justify-center md:h-10">
        <div className="relative h-5 w-full max-w-xl overflow-hidden text-center">
          {site.announcements.map((msg, i) => (
            <p
              key={msg}
              className={`absolute inset-0 flex items-center justify-center text-[11px] font-light tracking-[0.12em] transition-all duration-700 ease-luxury ${
                i === index ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            >
              {msg}
            </p>
          ))}
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="absolute right-4 flex h-6 w-6 items-center justify-center text-ivory-200/60 transition-colors hover:text-ivory-100 md:right-8"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
