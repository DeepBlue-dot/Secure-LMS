import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export function generateMFASecret() {
  const secret = authenticator.generateSecret();
  return secret;
}

export async function generateQRCode(email: string, secret: string) {
  const otpauth = authenticator.keyuri(email, 'SecureLMS', secret);
  return await QRCode.toDataURL(otpauth);
}

export function verifyMFAToken(token: string, secret: string) {
  return authenticator.check(token, secret);
}