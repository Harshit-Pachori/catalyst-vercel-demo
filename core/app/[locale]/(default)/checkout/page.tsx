import { getTranslations } from 'next-intl/server';
import { client } from '~/client';
import { GetEmbeddedCheckoutUrlMutation } from '~/client/mutations/get-embedded-checkout-url';
import { getCartId } from '~/lib/cart';
import CheckoutEmbed from '../cart/_components/checkoutEmbed';
import { getSessionCustomerAccessToken } from '~/auth';

export default async function EmbeddedCheckoutPage() {
  const t = await getTranslations('CheckoutPage');

  // Get cart ID
  const cartId = await getCartId();
  if (!cartId) {
    console.warn('EmbeddedCheckoutPage: No cart ID found.');
    return (
      <div className="container mx-auto p-4">
        <h1>{t('checkoutTitle')}</h1>
        <p>{t('cartNotFound')}</p>
        <a href="/cart" className="text-blue-600 underline">
          {t('returnToCart')}
        </a>
      </div>
    );
  }

  // Fetch embedded checkout URL
  let embeddedCheckoutUrl: string | null = null;
  let errorFetchingUrl = false;

  try {
    const customerAccessToken = await getSessionCustomerAccessToken();
  
    const { data, errors } = await client.fetch({
      document: GetEmbeddedCheckoutUrlMutation,
      variables: { cartId },
      fetchOptions: { cache: 'no-store' },
      customerAccessToken,
    });

    if (errors?.length) {
      console.error('EmbeddedCheckoutPage: GraphQL errors:', errors);
      errorFetchingUrl = true;
    } else if (!data?.cart?.createCartRedirectUrls?.redirectUrls?.embeddedCheckoutUrl) {
      console.error('EmbeddedCheckoutPage: No embeddedCheckoutUrl in response.');
      errorFetchingUrl = true;
    } else {
      embeddedCheckoutUrl = data.cart.createCartRedirectUrls.redirectUrls.embeddedCheckoutUrl;
    }
  } catch (error) {
    console.error('EmbeddedCheckoutPage: Failed to fetch embedded checkout URL:', error);
    errorFetchingUrl = true;
  }

  // Handle errors
  if (errorFetchingUrl || !embeddedCheckoutUrl) {
    return (
      <div className="container mx-auto p-4">
        <h1>{t('checkoutTitle')}</h1>
        <p>{t('errorLoadingCheckout')}</p>
        <a href="/cart" className="text-red-500 underline">
          {t('returnToCart')}
        </a>
      </div>
    );
  }

  // Render checkout
  return (
    <div className="container mx-auto font-serif">
      {/* <h1 className="px-10 text-2xl font-semibold" id="checkoutTitle">
        {t('checkoutTitle')}
      </h1> */}
      <CheckoutEmbed embeddedCheckoutUrl={embeddedCheckoutUrl} />
    </div>
  );
}
