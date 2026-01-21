import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, of, switchMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormErrorsComponent } from '../../../../shared/components/form-errors/form-errors.component';
import { AppButtonComponent } from '../../../../shared/components/app-button/app-button.component';
import {
  minTodayValidator,
  oneYearAfterReleaseValidator,
} from '../../../../shared/validators/date.validators';
import { formatDate, parseDateValue } from '../../../../shared/utils/date.util';
import { ProductsService } from '../../services/products.service';
import {
  ProductPayload,
  ProductUpdatePayload,
} from '../../models/product.model';
import {
  PRODUCT_FORM_DEFAULT,
  PRODUCT_FORM_MESSAGES,
} from '../../constants/product-form.constants';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    ReactiveFormsModule,
    FormErrorsComponent,
    AppButtonComponent,
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitError = signal('');
  readonly loadError = signal('');
  readonly isEdit = signal(false);
  readonly title = computed(() =>
    this.isEdit() ? 'Formulario de Edición' : 'Formulario de Registro',
  );
  readonly submitLabel = computed(() => (this.isEdit() ? 'Guardar' : 'Enviar'));

  readonly form = this.formBuilder.group({
    id: this.formBuilder.control(PRODUCT_FORM_DEFAULT.id, {
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
      ],
      asyncValidators: [this.idExistsValidator()],
      updateOn: 'change',
      nonNullable: true,
    }),
    name: this.formBuilder.control(PRODUCT_FORM_DEFAULT.name, {
      validators: [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(100),
      ],
      nonNullable: true,
    }),
    description: this.formBuilder.control(PRODUCT_FORM_DEFAULT.description, {
      validators: [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ],
      nonNullable: true,
    }),
    logo: this.formBuilder.control(PRODUCT_FORM_DEFAULT.logo, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    date_release: this.formBuilder.control(PRODUCT_FORM_DEFAULT.date_release, {
      validators: [Validators.required, minTodayValidator()],
      nonNullable: true,
    }),
    date_revision: this.formBuilder.control(
      PRODUCT_FORM_DEFAULT.date_revision,
      {
        validators: [Validators.required, oneYearAfterReleaseValidator()],
        nonNullable: true,
      },
    ),
  });

  private readonly initialValue = signal<ProductPayload | null>(null);

  constructor() {
    this.form.controls.date_release.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.syncRevisionDate(value);
        this.form.controls.date_revision.updateValueAndValidity();
      });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.submitError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEdit()) {
      this.submitEdit();
    } else {
      this.submitCreate();
    }
  }

  onReset(): void {
    this.submitted.set(false);
    this.submitError.set('');
    const resetValue = this.isEdit()
      ? this.initialValue()
      : PRODUCT_FORM_DEFAULT;

    if (!resetValue) return;
    this.form.reset(resetValue);
  }

  showError(control: AbstractControl): boolean {
    return (
      control.invalid && (control.touched || control.dirty || this.submitted())
    );
  }

  private submitCreate(): void {
    const payload = this.getFormValue();
    this.isSubmitting.set(true);
    this.productsService
      .createProduct(payload)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.onReset();
          this.router.navigateByUrl('/');
        },
        error: () => {
          this.submitError.set(PRODUCT_FORM_MESSAGES.createError);
        },
      });
  }

  private submitEdit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.submitError.set(PRODUCT_FORM_MESSAGES.notFoundError);
      return;
    }
    const payload = this.getUpdatePayload();
    this.isSubmitting.set(true);
    this.productsService
      .updateProduct(id, payload)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        },
        error: () => {
          this.submitError.set(PRODUCT_FORM_MESSAGES.updateError);
        },
      });
  }

  private loadProduct(id: string): void {
    this.productsService
      .getProductById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.isEdit.set(true);
          this.form.controls.id.disable({ emitEvent: false });
          this.form.controls.id.clearAsyncValidators();
          this.form.controls.id.updateValueAndValidity({ emitEvent: false });
          this.form.patchValue({
            id: product.id,
            name: product.name,
            description: product.description,
            logo: product.logo,
            date_release: product.date_release,
            date_revision: product.date_revision,
          });
          this.initialValue.set({ ...product });
          this.syncRevisionDate(product.date_release);
        },
        error: () => {
          this.loadError.set(PRODUCT_FORM_MESSAGES.loadError);
        },
      });
  }

  private syncRevisionDate(value: string): void {
    if (!value) {
      return;
    }
    const releaseDate = parseDateValue(value);
    if (!releaseDate) {
      return;
    }
    const nextYear = new Date(releaseDate);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const formatted = formatDate(nextYear);
    this.form.controls.date_revision.setValue(formatted, { emitEvent: false });
  }

  private idExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): ReturnType<AsyncValidatorFn> => {
      const value = (control.value ?? '').toString().trim();
      if (!value) {
        return of(null);
      }
      return timer(300).pipe(
        switchMap(() => this.productsService.checkIdExists(value)),
        map((exists) => (exists ? { idTaken: true } : null)),
        map((result) => (control.value === value ? result : null)),
      );
    };
  }

  private getFormValue(): ProductPayload {
    return this.form.getRawValue() as ProductPayload;
  }

  private getUpdatePayload(): ProductUpdatePayload {
    const { id, ...payload } = this.getFormValue();
    return payload;
  }

  get idControl(): AbstractControl<string> {
    return this.form.controls.id;
  }

  get nameControl(): AbstractControl<string> {
    return this.form.controls.name;
  }

  get descriptionControl(): AbstractControl<string> {
    return this.form.controls.description;
  }

  get logoControl(): AbstractControl<string> {
    return this.form.controls.logo;
  }

  get dateReleaseControl(): AbstractControl<string> {
    return this.form.controls.date_release;
  }

  get dateRevisionControl(): AbstractControl<string> {
    return this.form.controls.date_revision;
  }
}
