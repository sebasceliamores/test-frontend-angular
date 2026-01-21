import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { parseDateValue } from '../utils/date.util';

export const minTodayValidator = (): ValidatorFn => {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const valueDate = parseDateValue(control.value);
    if (!valueDate) {
      return { invalidDate: true };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return valueDate >= today ? null : { minToday: true };
  };
};

export const oneYearAfterReleaseValidator = (
  releaseControlName = 'date_release'
): ValidatorFn => {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const releaseValue = control.parent?.get(releaseControlName)?.value as
      | string
      | undefined;
    if (!releaseValue) {
      return null;
    }
    const releaseDate = parseDateValue(releaseValue);
    const revisionDate = parseDateValue(control.value);
    if (!releaseDate || !revisionDate) {
      return { invalidDate: true };
    }
    const expected = new Date(releaseDate);
    expected.setFullYear(expected.getFullYear() + 1);
    return revisionDate.getTime() === expected.getTime()
      ? null
      : { oneYearAfterRelease: true };
  };
};
