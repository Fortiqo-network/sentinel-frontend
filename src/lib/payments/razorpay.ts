/**
 * Razorpay Checkout loader. Loads the provider-hosted Checkout script on demand
 * and opens the payment widget. Sentinel never handles card data — Razorpay
 * renders the payment UI. The wallet is credited by the billing webhook, so the
 * success callback only needs to signal the UI to refresh the balance.
 */

interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  handler?: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
}

interface RazorpayInstance {
  open: () => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckoutScript(): Promise<RazorpayConstructor> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay Checkout is only available in the browser."));
      return;
    }
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error("Razorpay Checkout failed to initialise."));
    };
    script.onerror = () => reject(new Error("Could not load Razorpay Checkout."));
    document.body.appendChild(script);
  });
}

/** Options for opening the Razorpay-hosted checkout widget. */
export interface OpenRazorpayArgs {
  keyId: string;
  orderId: string;
  amountUnits: number;
  onSuccess: () => void;
  onDismiss?: () => void;
}

/**
 * Opens the Razorpay-hosted Checkout widget for a credit top-up.
 *
 * @example
 * await openRazorpayCheckout({ keyId, orderId, amountUnits: 100000, onSuccess: refresh });
 */
export async function openRazorpayCheckout(args: OpenRazorpayArgs): Promise<void> {
  const Razorpay = await loadCheckoutScript();
  const instance = new Razorpay({
    key: args.keyId,
    order_id: args.orderId,
    amount: args.amountUnits,
    currency: "INR",
    name: "Sentinel",
    description: "Credits top-up",
    handler: () => args.onSuccess(),
    modal: { ondismiss: () => args.onDismiss?.() },
    theme: { color: "#4f46e5" },
  });
  instance.open();
}
