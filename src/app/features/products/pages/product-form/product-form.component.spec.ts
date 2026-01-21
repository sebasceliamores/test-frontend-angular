import { provideLocationMocks } from '@angular/common/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { jest } from '@jest/globals';
import { of, throwError } from 'rxjs';

import { ProductsService } from '../../services/products.service';
import { createProduct } from '../../testing/products.fixtures';
import { ProductFormComponent } from './product-form.component';

describe('ProductFormComponent', () => {
  let productsService: {
    createProduct: jest.Mock;
    updateProduct: jest.Mock;
    getProductById: jest.Mock;
    checkIdExists: jest.Mock;
  };
  const withRouteId = (id: string | null) => ({
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'id' ? id : null),
      },
    },
  });

  beforeEach(async () => {
    productsService = {
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      getProductById: jest.fn(),
      checkIdExists: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ProductsService, useValue: productsService },
      ],
    }).compileComponents();
  });

  it('renders create mode by default', () => {
    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector(
      '[data-testid="form-title"]',
    )?.textContent;
    expect(title).toContain('Formulario');
    expect(component.isEdit()).toBe(false);
    expect(component.form.controls.id.enabled).toBe(true);
    expect(productsService.getProductById).not.toHaveBeenCalled();
  });

  it('loads product and disables id in edit mode', () => {
    const product = createProduct({ id: 'p1' });
    productsService.getProductById.mockReturnValue(of(product));

    TestBed.overrideProvider(ActivatedRoute, {
      useValue: withRouteId('p1'),
    });

    const fixture = TestBed.createComponent(ProductFormComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(productsService.getProductById).toHaveBeenCalledWith('p1');
    expect(component.isEdit()).toBe(true);
    expect(component.form.controls.id.disabled).toBe(true);
  });

  it('shows load error when edit product fails', () => {
    productsService.getProductById.mockReturnValue(
      throwError(() => new Error('fail')),
    );

    TestBed.overrideProvider(ActivatedRoute, {
      useValue: withRouteId('p1'),
    });

    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector(
      '[data-testid="load-error"]',
    )?.textContent;
    expect(error).toContain('No se pudo cargar');
    expect(component.isEdit()).toBe(false);
  });

  it('submits create when form is valid', () => {
    productsService.createProduct.mockReturnValue(of(createProduct()));

    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({
      id: 'prod-1',
      name: 'Cuenta Ahorro',
      description: 'Descripcion valida',
      logo: 'logo.png',
      date_release: '2030-01-01',
    });
    fixture.detectChanges();

    component.onSubmit();
    expect(productsService.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'prod-1',
        name: 'Cuenta Ahorro',
      }),
    );
  });

  it('does not submit create when form is invalid', () => {
    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onSubmit();
    expect(productsService.createProduct).not.toHaveBeenCalled();
  });

  it('submits edit when form is valid', () => {
    const product = createProduct({ id: 'p1' });
    productsService.getProductById.mockReturnValue(of(product));
    productsService.updateProduct.mockReturnValue(of(product));

    TestBed.overrideProvider(ActivatedRoute, {
      useValue: withRouteId('p1'),
    });

    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onSubmit();
    expect(productsService.updateProduct).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({
        name: product.name,
        description: product.description,
      }),
    );
  });

  it('updates date_revision when date_release changes', () => {
    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.controls.date_release.setValue('2030-01-20');
    fixture.detectChanges();

    expect(component.form.controls.date_revision.value).toBe('2031-01-20');
  });

  it('marks id as taken when checkIdExists returns true', fakeAsync(() => {
    productsService.checkIdExists.mockReturnValue(of(true));

    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.controls.id.setValue('taken-id');
    tick(300);
    fixture.detectChanges();

    expect(component.form.controls.id.errors?.['idTaken']).toBe(true);
  }));

  it('ignores id validation errors when checkIdExists fails', fakeAsync(() => {
    productsService.checkIdExists.mockReturnValue(
      throwError(() => new Error('fail')),
    );

    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.controls.id.setValue('broken-id');
    tick(300);
    fixture.detectChanges();

    expect(component.form.controls.id.errors?.['idTaken']).toBeUndefined();
  }));
});
