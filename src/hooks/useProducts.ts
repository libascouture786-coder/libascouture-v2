import { useEffect, useState, useCallback } from 'react';
import {
  fetchActiveProducts,
  fetchProductBySlug,
  fetchRelatedProducts,
  fetchProductsBySlugs,
} from '@/lib/api';
import type { ProductWithImages } from '@/lib/types';

type FetchState<T> = {
  data: T;
  loading: boolean;
  error: boolean;
  refetch: () => void;
};

export function useActiveProducts(): FetchState<ProductWithImages[]> {
  const [data, setData] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchActiveProducts().then((res) => {
      if (cancelled) return;
      if (res.error) {
        setData([]);
        setError(true);
      } else {
        setData(res.data);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [nonce]);

  return { data, loading, error, refetch };
}

type ProductDetailState = {
  product: ProductWithImages | null;
  related: ProductWithImages[];
  recentlyViewed: ProductWithImages[];
  loading: boolean;
  error: boolean;
  refetch: () => void;
};

export function useProductDetail(slug: string | undefined, recentlyViewedSlugs: string[]): ProductDetailState {
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [related, setRelated] = useState<ProductWithImages[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(false);

    (async () => {
      const prodRes = await fetchProductBySlug(slug);
      if (cancelled) return;
      if (prodRes.error) {
        setError(true);
        setProduct(null);
        setLoading(false);
        return;
      }
      if (!prodRes.data) {
        setProduct(null);
        setLoading(false);
        return;
      }
      setProduct(prodRes.data);

      const [relRes, rvRes] = await Promise.all([
        fetchRelatedProducts(prodRes.data.id),
        recentlyViewedSlugs.length > 0
          ? fetchProductsBySlugs(recentlyViewedSlugs)
          : Promise.resolve<{ data: ProductWithImages[]; error: null }>({ data: [], error: null }),
      ]);
      if (cancelled) return;
      setRelated(relRes.data ?? []);
      setRecentlyViewed(rvRes.data ?? []);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [slug, nonce, recentlyViewedSlugs.join(',')]);

  return { product, related, recentlyViewed, loading, error, refetch };
}
