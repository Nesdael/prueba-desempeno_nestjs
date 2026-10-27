import { Transform } from 'class-transformer';

/*
    - Removes spaces and converts the text to lowercase(e.g., email address)
    - if the value is not text, it leaves it as is so that class-validator can validate it
*/
export const ToLowerCase = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );

// Removes spaces and converts the text to uppercase(e.g., license plates)
export const ToUpperCase = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  );
