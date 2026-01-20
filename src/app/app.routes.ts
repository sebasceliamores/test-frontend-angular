import { Routes } from '@angular/router';
import { ProductsListComponent } from './products/products-list.component';
import { ProductCreateComponent } from './products/product-create.component';

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
