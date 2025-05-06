'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    checkoutKitLoader?: {
      load: (module: string) => Promise<any>;
    };
  }
}

interface CheckoutEmbedProps {
  embeddedCheckoutUrl: string;
}

export default function CheckoutEmbed({ embeddedCheckoutUrl }: CheckoutEmbedProps) {
  const containerId = 'checkout-app';
  const scriptLoaded = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [useFallbackIframe, setUseFallbackIframe] = useState(false);
 

  useEffect(() => {
    if (scriptLoaded.current) {
      console.log('CheckoutEmbed: Script already loaded, skipping');
      return;
    }

    const loadCheckout = async () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://checkout-sdk.bigcommerce.com/v1/loader.js';
        script.async = true;

        if (!document.querySelector(`script[src="${script.src}"]`)) {
          document.body.appendChild(script);
          console.log('CheckoutEmbed: Appending Checkout SDK script');
        } else {
          console.log('CheckoutEmbed: SDK script already exists');
        }

        script.onload = async () => {
          console.log('CheckoutEmbed: Checkout SDK script loaded successfully');
          if (!window.checkoutKitLoader) {
            console.error('CheckoutEmbed: checkoutKitLoader not available');
            setError('Checkout SDK loader not available. Using fallback iframe.');
            setUseFallbackIframe(true);
            setLoading(false);
            return;
          }

          try {
            console.log('CheckoutEmbed: Loading embedded-checkout module');
            const module = await window.checkoutKitLoader.load('embedded-checkout');
            console.log('CheckoutEmbed: Embedded checkout module loaded');

            if (!embeddedCheckoutUrl.includes('/session-sync?jwt=')) {
              console.error('CheckoutEmbed: Invalid embeddedCheckoutUrl format');
              setError('Invalid checkout URL format.');
              setLoading(false);
              return;
            }

            const service = module.embedCheckout({
              url: embeddedCheckoutUrl,
              containerId,
            });

            service
              .then(() => {
                console.log('CheckoutEmbed: Checkout embedded successfully');
                setLoading(false);
              })
              .catch((err: Error) => {
                console.error('CheckoutEmbed: Error embedding checkout:', err);
                const errorMessage = err.message.includes('NotEmbeddableError')
                  ? 'Checkout iframe blocked. Ensure http://localhost:3000 is added to BigCommerce Allowed Origins.'
                  : `Failed to load checkout: ${err.message}`;
                setError(errorMessage);
                setUseFallbackIframe(true); // Fallback to manual iframe
                setLoading(false);
              });
          } catch (err) {
            console.error('CheckoutEmbed: Failed to load embedded-checkout module:', err);
            setError('Failed to initialize checkout module. Using fallback iframe.');
            setUseFallbackIframe(true);
            setLoading(false);
          }
        };

        script.onerror = () => {
          console.error('CheckoutEmbed: Failed to load Checkout SDK script');
          setError('Failed to load checkout script. Using fallback iframe.');
          setUseFallbackIframe(true);
          setLoading(false);
        };

        scriptLoaded.current = true;
      } catch (err) {
        console.error('CheckoutEmbed: Unexpected error loading checkout:', err);
        setError('Unexpected error loading checkout. Using fallback iframe.');
        setUseFallbackIframe(true);
        setLoading(false);
      }
    };

    loadCheckout();

    return () => {
      const script = document.querySelector(
        `script[src="https://checkout-sdk.bigcommerce.com/v1/loader.js"]`,
      );
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [embeddedCheckoutUrl]);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
        <div className="mt-2">
          <a href="/cart" className="text-blue-600 underline">
            Return to Cart
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {loading && <div className="p-4 text-center">Loading checkout...</div>}
      {useFallbackIframe ? (
        <iframe
          src={embeddedCheckoutUrl}
          title="BigCommerce Embedded Checkout"
          width="100%"
          height="600"
          style={{ border: '1px solid #ccc' }}
          sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation"
        />
      ) : (
        <div id={containerId} className="w-full" style={{ minHeight: '600px' }} />
      )}
    </div>
  );
}
