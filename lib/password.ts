import argon2 from "argon2";

const PEPPER = process.env.PASSWORD_PEPPER || "system-default-pepper";

export async function hashPassword(password: string) {
  // Combine password with system pepper before hashing
  return await argon2.hash(password + PEPPER, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64MB
    timeCost: 3,
  });
}

export async function verifyPassword(password: string, hash: string) {
  return await argon2.verify(hash, password + PEPPER);
}