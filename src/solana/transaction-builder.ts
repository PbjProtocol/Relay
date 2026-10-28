import { RelayValidationError } from "../errors/relay-error";
/** Decodes API base64 transaction payloads for browser and Node wallets. */ export class TransactionBuilder {
  /** Decodes base64 into wallet-compatible bytes. */ static fromBase64(
    value: string,
  ): Uint8Array {
    try {
      if (typeof Buffer !== "undefined")
        return Uint8Array.from(Buffer.from(value, "base64"));
      const binary = atob(value);
      return Uint8Array.from(binary, (character) => character.charCodeAt(0));
    } catch (cause) {
      throw new RelayValidationError("Invalid base64 transaction", {
        code: "INVALID_TRANSACTION",
        cause,
      });
    }
  }
}
