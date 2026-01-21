import { Product } from '../models/product.model';

export const createProduct = (overrides: Partial<Product> = {}): Product => ({
  id: overrides.id ?? 'prod-1',
  name: overrides.name ?? 'Tarjeta Credito',
  description: overrides.description ?? 'Descripcion producto',
  logo: overrides.logo ?? '',
  date_release: overrides.date_release ?? '2025-01-01',
  date_revision: overrides.date_revision ?? '2026-01-01',
});

export const createProducts = (count: number): Product[] =>
  Array.from({ length: count }).map((_, index) =>
    createProduct({ id: `p${index}` })
  );
