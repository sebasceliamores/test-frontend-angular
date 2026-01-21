import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, tap } from 'rxjs';

import {
  Product,
  ProductPayload,
  ProductsResponse,
  ProductUpdatePayload,
} from '../models/product.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly productsUrl = `${environment.apiUrl}/products`;
  private productsCache$?: Observable<Product[]>;

  constructor(private readonly http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    if (!this.productsCache$) {
      this.productsCache$ = this.http
        .get<ProductsResponse>(this.productsUrl)
        .pipe(
          map((response) => response.data ?? []),
          shareReplay({ bufferSize: 1, refCount: true }),
        );
    }
    return this.productsCache$;
  }

  createProduct(payload: ProductPayload): Observable<Product> {
    return this.http
      .post<Product>(this.productsUrl, payload)
      .pipe(tap(() => this.clearProductsCache()));
  }

  getProductById(id: string): Observable<Product> {
    return this.getProducts().pipe(
      map((products) => products.find((product) => product.id === id)),
      map((product) => {
        if (!product) {
          throw new Error('Producto no encontrado.');
        }
        return product;
      }),
    );
  }

  updateProduct(id: string, payload: ProductUpdatePayload): Observable<Product> {
    return this.http
      .put<Product>(`${this.productsUrl}/${id}`, payload)
      .pipe(tap(() => this.clearProductsCache()));
  }

  checkIdExists(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.productsUrl}/verification/${id}`);
  }

  private clearProductsCache(): void {
    this.productsCache$ = undefined;
  }
}
