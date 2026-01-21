import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';

import { FormErrorsComponent } from './form-errors.component';

const getErrors = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelectorAll('[data-testid="form-error"]');

describe('FormErrorsComponent', () => {
  it('shows required error when control is touched', () => {
    const fixture = TestBed.createComponent(FormErrorsComponent);
    const component = fixture.componentInstance;
    const control = new FormControl('', Validators.required);

    control.markAsTouched();
    control.updateValueAndValidity();

    component.control = control;
    fixture.detectChanges();

    const errors = getErrors(fixture);
    expect(errors.length).toBe(1);
    expect(errors[0].textContent).toContain('Este campo es requerido!');
  });

  it('does not show errors when untouched and not submitted', () => {
    const fixture = TestBed.createComponent(FormErrorsComponent);
    const component = fixture.componentInstance;
    const control = new FormControl('', Validators.required);

    control.updateValueAndValidity();
    component.control = control;
    fixture.detectChanges();

    expect(getErrors(fixture).length).toBe(0);
  });

  it('shows errors when control is dirty', () => {
    const fixture = TestBed.createComponent(FormErrorsComponent);
    const component = fixture.componentInstance;
    const control = new FormControl('', Validators.required);

    control.markAsDirty();
    control.updateValueAndValidity();

    component.control = control;
    fixture.detectChanges();

    const errors = getErrors(fixture);
    expect(errors.length).toBe(1);
  });

  it('renders only the first error when showAll is false', () => {
    const fixture = TestBed.createComponent(FormErrorsComponent);
    const component = fixture.componentInstance;
    const control = new FormControl('');

    control.setErrors({
      required: true,
      minlength: { requiredLength: 3 },
    });
    control.markAsDirty();

    component.control = control;
    component.showAll = false;
    fixture.detectChanges();

    const errors = getErrors(fixture);
    expect(errors.length).toBe(1);
  });

  it('uses default messages for known errors', () => {
    const fixture = TestBed.createComponent(FormErrorsComponent);
    const component = fixture.componentInstance;
    const control = new FormControl('', Validators.required);

    control.markAsTouched();
    control.updateValueAndValidity();

    component.control = control;
    fixture.detectChanges();

    const errors = getErrors(fixture);
    expect(errors[0].textContent).toContain('Este campo es requerido!');
  });
});
