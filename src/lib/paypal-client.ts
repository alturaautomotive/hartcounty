export type PayPalNamespace = {
  Buttons: (opts: Record<string, unknown>) => {
    render: (el: string | HTMLElement) => void;
  };
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
    paypalSubscriptions?: PayPalNamespace;
  }
}

const PAYPAL_SUBSCRIPTION_SDK_ID = "paypal-subscription-sdk";

let subscriptionSdkPromise: Promise<PayPalNamespace> | null = null;

export function loadPayPalSubscriptionSdk(): Promise<PayPalNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PayPal SDK can only load in the browser"));
  }

  if (window.paypalSubscriptions) {
    return Promise.resolve(window.paypalSubscriptions);
  }

  if (subscriptionSdkPromise) {
    return subscriptionSdkPromise;
  }

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  if (!clientId) {
    return Promise.reject(new Error("Missing PayPal client ID"));
  }

  subscriptionSdkPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(
      PAYPAL_SUBSCRIPTION_SDK_ID
    ) as HTMLScriptElement | null;

    const handleLoad = () => {
      if (window.paypalSubscriptions) {
        resolve(window.paypalSubscriptions);
      } else {
        subscriptionSdkPromise = null;
        reject(new Error("PayPal subscription SDK did not initialize"));
      }
    };

    const handleError = () => {
      subscriptionSdkPromise = null;
      reject(new Error("Failed to load PayPal subscription SDK"));
    };

    if (existing) {
      existing.addEventListener("load", handleLoad, { once: true });
      existing.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = PAYPAL_SUBSCRIPTION_SDK_ID;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId
    )}&currency=USD&vault=true&intent=subscription`;
    script.async = true;
    script.setAttribute("data-namespace", "paypalSubscriptions");
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    document.head.appendChild(script);
  });

  return subscriptionSdkPromise;
}
