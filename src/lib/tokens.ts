import { randomBytes } from 'crypto';

export function generateToken() {
  return randomBytes(32).toString('hex');
}

export function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
