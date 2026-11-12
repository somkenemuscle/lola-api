import argon2 from 'argon2'

// OWASP's minimum Argon2id settings (19 MiB, 2 iterations). The library default uses 64 MiB per hash,
// which a small instance can't afford when several people log in at once.
const options = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const

export function hashPassword(password: string) {
  return argon2.hash(password, options)
}

export function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password)
}
