import { hashSync } from 'bcrypt-ts';

const CHARSET =
  'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%^&*';

export function generatePassword(length = 16): string {
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => CHARSET[n % CHARSET.length]).join('');
}

export function hashPassword(plain: string): string {
  const hash = hashSync(plain, 12);
  return `bcrypt:${hash}`;
}
