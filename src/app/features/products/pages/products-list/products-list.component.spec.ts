import { TestBed } from '@angular/core/testing';
import { jest } from '@jest/globals';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProductsListComponent } from './products-list.component';
import { ProductsService } from '../../services/products.service';
import {
  createProduct,
  createProducts,
} from '../../testing/products.fixtures';
import { PRODUCTS_LIST_TEST_IDS } from '../../testing/products-list.selectors';

describe('ProductsListComponent', () => {
  let productsService: { getProducts: jest.Mock };
  const queryAllByTestId = (fixture: { nativeElement: HTMLElement }, testId: string) =>
    fixture.nativeElement.querySelectorAll(`[data-testid="${testId}"]`);
  const queryByTestId = (fixture: { nativeElement: HTMLElement }, testId: string) =>
    fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);

  beforeEach(async () => {
    productsService = { getProducts: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ProductsListComponent],
      providers: [
        provideRouter([]),
        { provide: ProductsService, useValue: productsService },
      ],
    }).compileComponents();
  });

  it('renders products and shows count', () => {
    productsService.getProducts.mockReturnValue(
      of([createProduct({ id: 'p1' }), createProduct({ id: 'p2' })])
    );

    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const rows = queryAllByTestId(fixture, PRODUCTS_LIST_TEST_IDS.productRow);
    expect(rows.length).toBe(2);

    const count = queryByTestId(
      fixture,
      PRODUCTS_LIST_TEST_IDS.resultCount
    )?.textContent;
    expect(count).toContain('2');
  });

  it('filters products by search query', () => {
    productsService.getProducts.mockReturnValue(
      of([
        createProduct({ id: 'p1', name: 'Tarjeta Oro' }),
        createProduct({ id: 'p2', name: 'Cuenta Ahorro' }),
      ])
    );

    const fixture = TestBed.createComponent(ProductsListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onSearch('tarjeta');
    fixture.detectChanges();

    const rows = queryAllByTestId(fixture, PRODUCTS_LIST_TEST_IDS.productRow);
    expect(rows.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Tarjeta Oro');
  });

  it('filters products by id and description', () => {
    productsService.getProducts.mockReturnValue(
      of([
        createProduct({
          id: 'abc-1',
          name: 'Cuenta Ahorro',
          description: 'Producto exclusivo',
        }),
        createProduct({ id: 'xyz-2', name: 'Tarjeta Platino' }),
      ])
    );

    const fixture = TestBed.createComponent(ProductsListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onSearch('ABC-1');
    fixture.detectChanges();
    let rows = queryAllByTestId(fixture, PRODUCTS_LIST_TEST_IDS.productRow);
    expect(rows.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Cuenta Ahorro');

    component.onSearch('exclusivo');
    fixture.detectChanges();
    rows = queryAllByTestId(fixture, PRODUCTS_LIST_TEST_IDS.productRow);
    expect(rows.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Producto exclusivo');
  });

  it('limits results by page size', () => {
    productsService.getProducts.mockReturnValue(of(createProducts(6)));

    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const rows = queryAllByTestId(fixture, PRODUCTS_LIST_TEST_IDS.productRow);
    expect(rows.length).toBe(5);

    const count = queryByTestId(
      fixture,
      PRODUCTS_LIST_TEST_IDS.resultCount
    )?.textContent;
    expect(count).toContain('5');
  });

  it('updates results when page size changes', () => {
    productsService.getProducts.mockReturnValue(of(createProducts(12)));

    const fixture = TestBed.createComponent(ProductsListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onPageSizeChange('10');
    fixture.detectChanges();

    const rows = queryAllByTestId(fixture, PRODUCTS_LIST_TEST_IDS.productRow);
    expect(rows.length).toBe(10);
  });

  it('shows an error message when loading fails', () => {
    productsService.getProducts.mockReturnValue(
      throwError(() => new Error('fail'))
    );

    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const error = queryByTestId(
      fixture,
      PRODUCTS_LIST_TEST_IDS.productsError
    )?.textContent;
    expect(error).toContain('No se pudo cargar los productos.');
  });

  it('shows empty state when there are no products', () => {
    productsService.getProducts.mockReturnValue(of([]));

    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const empty = queryByTestId(fixture, PRODUCTS_LIST_TEST_IDS.productsEmpty)
      ?.textContent;
    expect(empty).toContain('No hay productos');
  });

  it('shows initials when logo fails to load', () => {
    const product = createProduct({
      id: 'p1',
      name: 'Juan Carlos Zamora',
      logo: 'bad-url',
    });
    productsService.getProducts.mockReturnValue(of([product]));

    const fixture = TestBed.createComponent(ProductsListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onLogoError(product);
    fixture.detectChanges();

    const initials = queryByTestId(
      fixture,
      PRODUCTS_LIST_TEST_IDS.logoInitials
    )?.textContent;
    expect(initials).toContain('JC');
  });

  it('shows initials when logo is empty', () => {
    const product = createProduct({ id: 'p1', name: 'Maria Lopez', logo: '' });
    productsService.getProducts.mockReturnValue(of([product]));

    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const initials = queryByTestId(
      fixture,
      PRODUCTS_LIST_TEST_IDS.logoInitials
    )?.textContent;
    expect(initials).toContain('ML');
  });

  it('toggles the contextual menu for edit', () => {
    const product = createProduct({ id: 'p1' });
    productsService.getProducts.mockReturnValue(of([product]));

    const fixture = TestBed.createComponent(ProductsListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.toggleMenu(product);
    fixture.detectChanges();

    const menuItem = queryByTestId(
      fixture,
      PRODUCTS_LIST_TEST_IDS.menuEdit
    )?.textContent;
    expect(menuItem).toContain('Editar');
  });

  it('closes the contextual menu when toggled twice', () => {
    const product = createProduct({ id: 'p1' });
    productsService.getProducts.mockReturnValue(of([product]));

    const fixture = TestBed.createComponent(ProductsListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.toggleMenu(product);
    fixture.detectChanges();
    component.toggleMenu(product);
    fixture.detectChanges();

    const menuItem = queryByTestId(
      fixture,
      PRODUCTS_LIST_TEST_IDS.menuEdit
    );
    expect(menuItem).toBeNull();
  });
});
