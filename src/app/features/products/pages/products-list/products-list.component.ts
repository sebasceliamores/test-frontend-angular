import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { PAGE_SIZES_LIST } from '../../constants/products-list.constants';
import { EPageSize } from '../../enums/products-list.enum';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [NgForOf, NgIf, RouterLink],
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
    const visible = filtered.slice(0, size);
    return {
      products: visible,
      total: filtered.length,
      shown: visible.length,
      pageSize: size,
      error: state.error,
    };
  });

  readonly logoErrors = signal<Record<string, boolean>>({});

  trackById(index: number, product: Product): string {
    return product.id ?? String(index);
  }

  getLogoKey(product: Product): string {
    return product.id || product.name;
  }

  hasLogoError(product: Product): boolean {
    return Boolean(this.logoErrors()[this.getLogoKey(product)]);
  }

  onLogoError(product: Product): void {
    const key = this.getLogoKey(product);
    this.logoErrors.update((state) => ({ ...state, [key]: true }));
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
