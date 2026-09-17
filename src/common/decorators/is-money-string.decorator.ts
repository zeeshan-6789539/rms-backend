import {
  registerDecorator,
  type ValidationOptions,
} from 'class-validator';

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

// A non-negative monetary amount as a string, up to 2 decimal places — matches
// the numeric(10,2) columns this feeds (leases, charges, payments amounts)
export function IsMoneyString(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string | symbol): void => {
    registerDecorator({
      name: 'isMoneyString',
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && MONEY_PATTERN.test(value);
        },
        defaultMessage(): string {
          return `${propertyName.toString()} must be a monetary amount with up to 2 decimal places`;
        },
      },
    });
  };
}
