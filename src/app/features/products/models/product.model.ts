export interface Product {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export type ProductPayload = Product;

export type ProductUpdatePayload = Omit<ProductPayload, 'id'>;

export interface ProductsResponse {
  data: Product[];
}
