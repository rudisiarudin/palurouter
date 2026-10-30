import { extractClientApiKey } from "@/sse/services/keyAccess.js";
import { getApiKeyByKey } from "@/lib/db/repos/apiKeysRepo.js";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

/**
 * GET /v1/user/balance - Client balance check endpoint.
 * Standard endpoint for users / client apps to verify remaining balance and usage.
 */
export async function GET(request) {
  try {
    const keyStr = extractClientApiKey(request);
    if (!keyStr) {
      return Response.json(
        {
          error: {
            message: "Missing API key in Authorization (Bearer ...) or x-api-key header.",
            type: "invalid_request_error",
            code: "missing_api_key",
          },
        },
        { status: 401, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const keyRecord = await getApiKeyByKey(keyStr);
    if (!keyRecord) {
      return Response.json(
        {
          error: {
            message: "Invalid API key.",
            type: "invalid_request_error",
            code: "invalid_api_key",
          },
        },
        { status: 401, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const isUnlimited = keyRecord.balance === null || keyRecord.balance === undefined;
    const balance = isUnlimited ? null : Number(keyRecord.balance);
    const creditLimit =
      keyRecord.creditLimit !== null && keyRecord.creditLimit !== undefined
        ? Number(keyRecord.creditLimit)
        : null;
    const spent = Number(keyRecord.spent || 0);

    const formattedBalance = isUnlimited
      ? "Unlimited"
      : `Rp ${Math.round(balance).toLocaleString("id-ID")}`;
    const formattedSpent = `Rp ${spent.toLocaleString("id-ID", { maximumFractionDigits: 2 })}`;

    return Response.json(
      {
        object: "balance",
        currency: "IDR",
        key_id: keyRecord.id,
        key_name: keyRecord.name || "Default Key",
        is_active: keyRecord.isActive,
        is_unlimited: isUnlimited,
        balance: balance,
        balance_idr: balance,
        credit_limit: creditLimit,
        credit_limit_idr: creditLimit,
        spent: spent,
        spent_idr: spent,
        balance_formatted: formattedBalance,
        spent_formatted: formattedSpent,
        rate_limit_rpm: keyRecord.rateLimitRpm || null,
        created_at: keyRecord.createdAt,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return Response.json(
      { error: { message: error.message, type: "server_error" } },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
