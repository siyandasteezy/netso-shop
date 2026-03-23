/**
 * Mobile PayFast bridge.
 * The mobile app opens this page after calling /api/payfast/initiate.
 * It auto-submits the PayFast form so the user lands on the PayFast
 * payment page without the app needing to do a POST directly.
 */
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function MobilePayBridge({ searchParams }: Props) {
  const params = await searchParams;
  const { pf_url, ...fields } = params;

  if (!pf_url || !fields.merchant_id) redirect("/");

  const payfastUrl = decodeURIComponent(pf_url);

  return (
    <html>
      <head><title>Redirecting to payment…</title></head>
      <body style={{ background: "#000", color: "#fff", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, letterSpacing: 2 }}>REDIRECTING TO PAYFAST…</p>
          <form id="pf" method="POST" action={payfastUrl}>
            {Object.entries(fields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
          </form>
          <script dangerouslySetInnerHTML={{ __html: "document.getElementById('pf').submit();" }} />
        </div>
      </body>
    </html>
  );
}
