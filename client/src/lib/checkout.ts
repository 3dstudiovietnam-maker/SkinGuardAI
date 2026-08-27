// Where the Buy buttons send people — Lemon Squeezy, our Merchant of Record.
//
// One place for the links so the price a card advertises can never drift from
// the product the click actually charges. (That drift is exactly what happened
// with the old Gumroad links, where the Pro Plus card opened the monthly Pro
// product, and the two paywall screens used two different Lifetime slugs.)
//
// A signed-in buyer's id and address are attached to the checkout, because they
// are what lets the webhook hand the purchase to the right account the instant
// it is paid — see server/_core/lemonSqueezy.ts. Without them the purchase is
// matched by e-mail, and if the buyer pays with a different address than they
// registered with, it waits in `pending_purchases` until they next sign in.
//
// TEST-MODE links. Lemon Squeezy keeps test and live data completely apart, so
// going live means recreating the products and swapping both these URLs and the
// LEMON_SQUEEZY_VARIANTS environment variable for their live-mode counterparts.

export type PaidPlan = "pro" | "pro_plus" | "lifetime";

const CHECKOUT: Record<PaidPlan, string> = {
  // SkinGuard AI Pro — Monthly · $6.90 / month
  pro: "https://healthguardai.lemonsqueezy.com/checkout/buy/a184fdf4-523a-448f-a1f1-9c833ca3c6ae",
  // SkinGuard AI Pro Plus — Annual · $49 / year
  pro_plus: "https://healthguardai.lemonsqueezy.com/checkout/buy/b5259430-a9a9-453e-beb6-b653a5f7812a",
  // SkinGuard AI Lifetime · $79 one-time
  lifetime: "https://healthguardai.lemonsqueezy.com/checkout/buy/baedd867-3cae-4800-a30a-b70ac20faf11",
};

export function checkoutUrl(
  plan: PaidPlan,
  buyer?: { id?: number | string | null; email?: string | null }
): string {
  const url = new URL(CHECKOUT[plan]);
  if (buyer?.id) url.searchParams.set("checkout[custom][user_id]", String(buyer.id));
  if (buyer?.email) url.searchParams.set("checkout[email]", buyer.email);
  return url.toString();
}

export function openCheckout(plan: PaidPlan, buyer?: { id?: number | string | null; email?: string | null }) {
  window.open(checkoutUrl(plan, buyer), "_blank", "noopener,noreferrer");
}
