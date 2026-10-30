export const DEFAULT_USD_TO_IDR = 16000;

/**
 * Format an amount in Indonesian Rupiah (Rp).
 * @param {number|string|null|undefined} amount
 * @param {{ showDecimals?: boolean, maxDecimals?: number }} options
 * @returns {string} e.g. "Rp 50.000" or "Rp 12.500,50"
 */
export function formatRupiah(amount, options = {}) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "Rp 0";
  }
  const val = Number(amount);
  const { showDecimals = false, maxDecimals = 2 } = options;

  return `Rp ${val.toLocaleString("id-ID", {
    minimumFractionDigits: showDecimals ? maxDecimals : 0,
    maximumFractionDigits: maxDecimals,
  })}`;
}

/**
 * Convert USD to IDR with a given or default rate
 */
export function usdToIdr(amountUsd, rate = DEFAULT_USD_TO_IDR) {
  return (Number(amountUsd) || 0) * (Number(rate) || DEFAULT_USD_TO_IDR);
}

/**
 * Convert IDR to USD with a given or default rate
 */
export function idrToUsd(amountIdr, rate = DEFAULT_USD_TO_IDR) {
  const r = Number(rate) || DEFAULT_USD_TO_IDR;
  return r > 0 ? (Number(amountIdr) || 0) / r : 0;
}
