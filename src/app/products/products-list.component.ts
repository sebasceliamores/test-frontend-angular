import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { catchError, map, of } from 'rxjs';

import { ProductsService } from './products.service';
import { Product } from './product.model';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [AsyncPipe, NgForOf, NgIf],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent {
  private readonly productsService = inject(ProductsService);

  readonly vm$ = this.productsService.getProducts().pipe(
    map((products) => {
      console.log('PRODUCT', products);
      return { products, error: '' as string };
    }),
    catchError(() =>
      of({
        products: [] as Product[],
        error: 'No se pudo cargar los productos.',
      }),
    ),
  );

  trackById(index: number, product: Product): string {
    return product.id ?? String(index);
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
  }
}
