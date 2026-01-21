import { ProductPayload } from '../models/product.model';

export const PRODUCT_FORM_DEFAULT: ProductPayload = {
  id: '',
  name: '',
  description: '',
  logo: '',
  date_release: '',
  date_revision: '',
};

export const PRODUCT_FORM_MESSAGES = {
  createError: 'No se pudo registrar el producto.',
  updateError: 'No se pudo actualizar el producto.',
  notFoundError: 'No se encontro el producto.',
  loadError: 'No se pudo cargar el producto.',
} as const;
