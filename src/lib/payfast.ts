import crypto from "crypto";

const SANDBOX = process.env.PAYFAST_SANDBOX === "true";
const PAYFAST_URL = SANDBOX
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

export interface PayFastPaymentData {
  orderId: string;
  amount: number;
  itemName: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName?: string;
}

/**
 * Generates the MD5 signature required by PayFast.
 * All fields must be in the exact order PayFast expects.
 */
function generateSignature(data: Record<string, string>, passphrase?: string): string {
  // Build query string in correct order, skipping empty values
  const pairs = Object.entries(data)
    .filter(([, v]) => v !== "" && v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, "+")}`)
    .join("&");

  const stringToHash = passphrase
    ? `${pairs}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
    : pairs;

  return crypto.createHash("md5").update(stringToHash).digest("hex");
}

/**
 * Build the PayFast payment payload and return both the URL and fields.
 */
export function buildPayFastPayload(data: PayFastPaymentData): {
  url: string;
  fields: Record<string, string>;
} {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const merchantId = process.env.PAYFAST_MERCHANT_ID!;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY!;
  const passphrase = process.env.PAYFAST_PASSPHRASE;

  const nameParts = data.customerFirstName.split(" ");
  const firstName = nameParts[0];
  const lastName = data.customerLastName || nameParts.slice(1).join(" ") || "-";

  // Fields MUST be in this exact order for PayFast signature
  const fields: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${baseUrl}/checkout/success`,
    cancel_url: `${baseUrl}/checkout/cancel`,
    notify_url: `${baseUrl}/api/payfast/notify`,
    name_first: firstName,
    name_last: lastName,
    email_address: data.customerEmail,
    m_payment_id: data.orderId,
    amount: data.amount.toFixed(2),
    item_name: data.itemName.substring(0, 100),
  };

  const signature = generateSignature(fields, passphrase);
  fields.signature = signature;

  return { url: PAYFAST_URL, fields };
}

/**
 * Verify a PayFast ITN (Instant Transaction Notification).
 * Returns true if the notification is valid.
 */
export async function verifyPayFastITN(
  params: Record<string, string>
): Promise<boolean> {
  try {
    const passphrase = process.env.PAYFAST_PASSPHRASE;

    // 1. Recreate the signature
    const { signature: receivedSig, ...dataWithoutSig } = params;

    // Filter and order fields (exclude signature)
    const orderedParams = Object.fromEntries(
      Object.entries(dataWithoutSig).filter(([, v]) => v !== "")
    );

    const computed = generateSignature(orderedParams, passphrase);

    if (computed !== receivedSig) {
      console.error("PayFast signature mismatch", { computed, received: receivedSig });
      return false;
    }

    // 2. Verify with PayFast server (anti-phishing check)
    const validHosts = SANDBOX
      ? ["sandbox.payfast.co.za"]
      : ["www.payfast.co.za", "w1w.payfast.co.za", "w2w.payfast.co.za"];

    const queryString = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    const host = validHosts[0];
    const verifyRes = await fetch(`https://${host}/eng/query/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: queryString,
    });

    const verifyText = await verifyRes.text();
    return verifyText === "VALID";
  } catch (err) {
    console.error("PayFast ITN verification error:", err);
    return false;
  }
}
