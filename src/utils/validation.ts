import { RelayValidationError } from "../errors/relay-error";
/** Throws when a required string is blank. */ export function requireString(
  value: string,
  field: string,
): void {
  if (typeof value !== "string" || value.trim() === "")
    throw new RelayValidationError(`${field} is required`, {
      code: "VALIDATION_ERROR",
      details: { field },
    });
}
/** Validates a positive USDC decimal string with up to six decimals. */ export function requireAmount(
  value: string,
  field = "amount",
): void {
  requireString(value, field);
  if (
    !/^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(value) ||
    /^0(?:\.0{1,6})?$/.test(value)
  )
    throw new RelayValidationError(
      `${field} must be a positive decimal string with at most 6 decimal places`,
      { code: "INVALID_AMOUNT", details: { field } },
    );
}
/** Validates an ISO date. */ export function requireIsoDate(
  value: string,
  field: string,
): void {
  requireString(value, field);
  if (Number.isNaN(Date.parse(value)))
    throw new RelayValidationError(`${field} must be a valid ISO date`, {
      code: "INVALID_DATE",
      details: { field },
    });
}
/** Validates a plausible base58 Solana public key. */ export function isWalletAddress(
  value: string,
): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}
/** Throws if a wallet is malformed. */ export function requireWallet(
  value: string,
  field: string,
): void {
  if (!isWalletAddress(value))
    throw new RelayValidationError(`${field} is not a valid Solana address`, {
      code: "INVALID_WALLET",
      details: { field },
    });
}
/** Validates positive pagination values. */ export function validatePagination(
  page?: number,
  limit?: number,
): void {
  if (page !== undefined && (!Number.isInteger(page) || page < 1))
    throw new RelayValidationError("page must be a positive integer", {
      code: "INVALID_PAGINATION",
    });
  if (
    limit !== undefined &&
    (!Number.isInteger(limit) || limit < 1 || limit > 100)
  )
    throw new RelayValidationError("limit must be between 1 and 100", {
      code: "INVALID_PAGINATION",
    });
}
