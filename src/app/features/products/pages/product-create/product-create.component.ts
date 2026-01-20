import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, map, of, switchMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductsService } from '../../services/products.service';
import { ProductPayload } from '../../models/product.model';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [NgClass, NgIf, ReactiveFormsModule],
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreateComponent {
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitError = signal('');

  readonly form = this.formBuilder.group({
    id: this.formBuilder.control('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
      ],
      asyncValidators: [this.idExistsValidator()],
      updateOn: 'change',
      nonNullable: true,
    }),
    name: this.formBuilder.control('', {
      validators: [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(100),
      ],
      nonNullable: true,
    }),
    description: this.formBuilder.control('', {
      validators: [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ],
      nonNullable: true,
    }),
    logo: this.formBuilder.control('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    date_release: this.formBuilder.control('', {
      validators: [Validators.required, this.minTodayValidator()],
      nonNullable: true,
    }),
    date_revision: this.formBuilder.control('', {
      validators: [Validators.required, this.oneYearAfterReleaseValidator()],
      nonNullable: true,
    }),
  });

  constructor() {
    this.form.controls.date_release.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.syncRevisionDate(value);
        this.form.controls.date_revision.updateValueAndValidity();
      });
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

  onSubmit(): void {
    this.submitted.set(true);
    this.submitError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as ProductPayload;
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
          this.submitError.set('No se pudo registrar el producto.');
        },
      });
  }

  onReset(): void {
    this.submitted.set(false);
    this.submitError.set('');
    this.form.reset({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: '',
    });
  }

  showError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitted());
  }

  private minTodayValidator() {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const valueDate = new Date(control.value);
      if (Number.isNaN(valueDate.getTime())) {
        return { invalidDate: true };
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      valueDate.setHours(0, 0, 0, 0);
      return valueDate >= today ? null : { minToday: true };
    };
  }

  private oneYearAfterReleaseValidator() {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const releaseValue = control.parent?.get('date_release')?.value as
        | string
        | undefined;
      if (!releaseValue) {
        return null;
      }
      const releaseDate = this.parseDateValue(releaseValue);
      const revisionDate = this.parseDateValue(control.value);
      if (!releaseDate || !revisionDate) {
        return { invalidDate: true };
      }
      const expected = new Date(releaseDate);
      expected.setFullYear(expected.getFullYear() + 1);
      return revisionDate.getTime() === expected.getTime()
        ? null
        : { oneYearAfterRelease: true };
    };
  }

  private syncRevisionDate(value: string): void {
    if (!value) {
      return;
    }
    const releaseDate = this.parseDateValue(value);
    if (!releaseDate) {
      return;
    }
    const nextYear = new Date(releaseDate);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const formatted = this.formatDate(nextYear);
    this.form.controls.date_revision.setValue(formatted, { emitEvent: false });
  }

  private parseDateValue(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!year || !month || !day) {
      return null;
    }
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
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
}
