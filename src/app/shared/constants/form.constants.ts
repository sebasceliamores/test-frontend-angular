import { ValidatorUtil } from '../utils/validatorUtil.class';

export const REQUIRED_FIELD_MESSAGE = 'Este campo es requerido!';
export const MIN_LENGTH_MESSAGE = 'Minimo {{count}} caracteres';
export const MAX_LENGTH_MESSAGE = 'Maximo {{count}} caracteres';
export const INVALID_ID_MESSAGE = 'ID no valido';
export const INVALID_DATE_MESSAGE = 'Fecha invalida';
export const MIN_TODAY_MESSAGE = 'La fecha debe ser igual o mayor a hoy';
export const ONE_YEAR_AFTER_MESSAGE =
  'La fecha debe ser un año posterior a liberación';

export const MESSAGE_ERRORS: Record<
  string,
  string | ((error: unknown) => string)
> = {
  required: REQUIRED_FIELD_MESSAGE,
  minlength: (error) => ValidatorUtil.withCount(MIN_LENGTH_MESSAGE, error),
  maxlength: (error) => ValidatorUtil.withCount(MAX_LENGTH_MESSAGE, error),
  idTaken: INVALID_ID_MESSAGE,
  invalidDate: INVALID_DATE_MESSAGE,
  minToday: MIN_TODAY_MESSAGE,
  oneYearAfterRelease: ONE_YEAR_AFTER_MESSAGE,
};
