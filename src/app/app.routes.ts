import { Routes } from '@angular/router';
import { ProductsListComponent } from './features/products/pages/products-list/products-list.component';
import { ProductCreateComponent } from './features/products/pages/product-create/product-create.component';

export const routes: Routes = [
  {
    path: '',
    component: ProductsListComponent
  },
  {
    path: 'products/new',
    component: ProductCreateComponent
  }
];
