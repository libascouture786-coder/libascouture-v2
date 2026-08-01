import { fabricOptions, colorSwatches } from '@/config/customisation';

export type QuickProduct = {
  id: string;
  imageUrl: string;
  name: string;
  code: string;
  price: string;
  color: string;
  fabric: string;
  work_type: string;
  savedProductId: string | null;
};

export const occasionOptions = ['Wedding', 'Engagement', 'Other Functions'] as const;

export const workTypeOptions = ['Hand Work', 'Machine Work', 'Mix Work'] as const;

export function makeProduct(imageUrl: string, code: string): QuickProduct {
  return {
    id: crypto.randomUUID(),
    imageUrl,
    name: '',
    code,
    price: '',
    color: '',
    fabric: '',
    work_type: '',
    savedProductId: null,
  };
}

export { fabricOptions, colorSwatches };
