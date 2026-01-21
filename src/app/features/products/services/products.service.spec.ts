import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { lastValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ProductsService } from './products.service';
import { createProduct } from '../testing/products.fixtures';
import { ProductPayload, ProductUpdatePayload } from '../models/product.model';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getProducts maps response data', async () => {
    const promise = lastValueFrom(service.getProducts());

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [createProduct({ id: 'p1' })] });

    await expect(promise).resolves.toEqual([
      expect.objectContaining({ id: 'p1' }),
    ]);
  });

  it.each([
    ['data null', { data: null }],
    ['empty object', {}],
    ['empty array', { data: [] }],
  ])('getProducts returns empty array when data is %s', async (_, response) => {
    const promise = lastValueFrom(service.getProducts());

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('GET');
    req.flush(response as { data?: unknown });

    await expect(promise).resolves.toEqual([]);
  });

  it('createProduct posts payload', async () => {
    const payload: ProductPayload = createProduct({ id: 'p1' });
    const promise = lastValueFrom(service.createProduct(payload));

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(payload);

    await expect(promise).resolves.toEqual(payload);
  });

  it('updateProduct sends put with id', async () => {
    const payload: ProductUpdatePayload = {
      name: 'Producto',
      description: 'Descripcion',
      logo: 'logo.png',
      date_release: '2030-01-01',
      date_revision: '2031-01-01',
    };
    const promise = lastValueFrom(service.updateProduct('p1', payload));

    const req = httpMock.expectOne(`${environment.apiUrl}/products/p1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...payload, id: 'p1' });

    await expect(promise).resolves.toEqual({ ...payload, id: 'p1' });
  });

  it('checkIdExists calls verification endpoint', async () => {
    const promise = lastValueFrom(service.checkIdExists('p1'));

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products/verification/p1`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(true);

    await expect(promise).resolves.toBe(true);
  });

  it('getProductById returns the product when found', async () => {
    const promise = lastValueFrom(service.getProductById('p1'));

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [createProduct({ id: 'p1' })] });

    await expect(promise).resolves.toEqual(
      expect.objectContaining({ id: 'p1' }),
    );
  });

  it('getProductById errors when product does not exist', async () => {
    const promise = lastValueFrom(service.getProductById('missing'));

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [createProduct({ id: 'p1' })] });

    await expect(promise).rejects.toThrow('Producto no encontrado.');
  });
});
