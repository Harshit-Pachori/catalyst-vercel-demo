import { getTranslations } from 'next-intl/server';

export default async function CheckoutLoading() {
  const t = await getTranslations('CheckoutPage'); 
  return (
    <div>
      <h1>{t('checkoutTitle')}</h1>
   
      <p>{t('loadingMessage')}</p>
    </div>
  );
}
