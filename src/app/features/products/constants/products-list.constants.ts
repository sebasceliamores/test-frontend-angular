import { EPageSize } from '../enums/products-list.enum';

export const PAGE_SIZES_LIST = [
  EPageSize.PAGE_SIZE_5,
  EPageSize.PAGE_SIZE_10,
  EPageSize.PAGE_SIZE_20,
] as const;

export const PRODUCTS_LIST_LABELS = {
  logo: 'Logo',
  name: 'Nombre del producto',
  description: 'Descripción',
  releaseDate: 'Fecha de liberación',
  revisionDate: 'Fecha de reestructuración',
  menu: 'Opciones del producto',
} as const;
