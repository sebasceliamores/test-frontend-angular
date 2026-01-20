import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

import { ProductsService } from './products.service';
import { Product } from './product.model';
import { EPageSize } from './enums/products-list.enum';
import { PAGE_SIZES_LIST } from './constants/products-list.constants';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [NgForOf, NgIf],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent {
  private readonly productsService = inject(ProductsService);

  readonly PAGE_SIZES_LIST = PAGE_SIZES_LIST;
  readonly searchQuery = signal('');
  readonly pageSize = signal(EPageSize.PAGE_SIZE_5);

  private readonly productsState$ = this.productsService.getProducts().pipe(
    map((products) => ({ products, error: '' as string })),
    catchError(() =>
      of({
        products: [] as Product[],
        error: 'No se pudo cargar los productos.',
      }),
    ),
  );

  private readonly productsState = toSignal(this.productsState$, {
    initialValue: { products: [] as Product[], error: '' as string },
  });

  readonly productsView = computed(() => {
    const state = this.productsState();
    const query = this.searchQuery().trim().toLowerCase();
    const size = this.pageSize();
    const filtered = query
      ? state.products.filter((product) => this.matchesQuery(product, query))
      : state.products;
    return {
      products: filtered.slice(0, size),
      total: filtered.length,
      pageSize: size,
      error: state.error,
    };
  });

  trackById(index: number, product: Product): string {
    return product.id ?? String(index);
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  onPageSizeChange(value: string): void {
    const nextValue = Number.parseInt(value, 10);
    if (!Number.isNaN(nextValue)) {
      this.pageSize.set(nextValue);
    }
  }

  private matchesQuery(product: Product, query: string): boolean {
    return (
      product.id.toLowerCase().includes(query) ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }
}
