export const validateInput = (input: string) =>
  input.match(/^([0-9]{1,})?(\.)?([0-9]{1,})?$/);
