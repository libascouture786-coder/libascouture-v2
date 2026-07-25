import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { storage, type WishlistItem } from '@/lib/storage';
import { useToast } from '@/context/ToastContext';

type WishlistContextValue = {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  isSaved: (id: string) => boolean;
  count: number;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { notify } = useToast();

  const items = storage.getWishlist();

  const toggle = useCallback(
    (item: WishlistItem) => {
      const added = storage.toggleWishlist(item);
      notify(
        added
          ? `${item.title} added to your wishlist.`
          : `${item.title} removed from your wishlist.`,
        added ? 'success' : 'info',
      );
      // Force re-render by dispatching a storage event
      window.dispatchEvent(new Event('libas:wishlist-change'));
    },
    [notify],
  );

  const isSaved = useCallback((id: string) => storage.isInWishlist(id), []);
  const clear = useCallback(() => {
    storage.clearWishlist();
    window.dispatchEvent(new Event('libas:wishlist-change'));
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({ items, toggle, isSaved, count: items.length, clear }),
    [items, toggle, isSaved, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
