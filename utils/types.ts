export type Override<T, U> = Omit<T, keyof U> & U;

export type RequiredFieldsOnly<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};
