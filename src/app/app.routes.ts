import { Routes } from '@angular/router';
import { ProductsListComponent } from './features/products/pages/products-list/products-list.component';
import { ProductFormComponent } from './features/products/pages/product-form/product-form.component';

export const routes: Routes = [
  {
    path: '',
    component: ProductsListComponent
  },
  {
    path: 'products/new',
    component: ProductFormComponent
  },
  {
    path: 'products/:id/edit',
    component: ProductFormComponent
  }
];
