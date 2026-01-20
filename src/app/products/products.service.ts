import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { Product, ProductsResponse } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly productsUrl = `${environment.apiUrl}/products`;

  constructor(private readonly http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http
      .get<ProductsResponse>(this.productsUrl)
      .pipe(map((response) => response.data ?? []));
  }
}
