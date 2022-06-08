export const MAX_JWT_VALIDITY_IN_MS = 10 * 60 * 1000;
// JWT validity is tied to the access-refresh tokens for simplicity, which are stored inside as claim.
// since the JWT is supposed to be renewed in the last 5 minutes of its validity window time,
// it means that the refresh token should be always valid longer than > 5min
export const MIN_JWT_RENEW_IN_MS = MAX_JWT_VALIDITY_IN_MS - 5 * 60 * 1000;
