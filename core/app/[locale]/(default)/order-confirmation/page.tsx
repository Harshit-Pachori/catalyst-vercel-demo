import { notFound, useSearchParams } from 'next/navigation';
import { getTranslations } from 'next-intl/server';


export default async function OrderConfirmationPage() {
  const t = await getTranslations('OrderConfirmationPage'); //
  const orderId = useSearchParams().get("orderId");

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">{t('orderConfirmationTitle')}</h1>
      {orderId ? (
        <>
          <p className="mb-4">{t('thankYouMessage')}</p>
          <div className="rounded bg-gray-50 p-4">
            <p className="font-semibold">
              {t('yourOrderNumber')}: <span className="font-normal">{orderId}</span>
            </p>
            
          </div>
          <div className="mt-6">
            <a href="/" className="text-blue-600 underline">
              {t('continueShopping')}
            </a>
          </div>
        </>
      ) : (
        <div className="text-red-500">
          <p>{t('noOrderFound')}</p>
          <a href="/" className="mt-4 block text-blue-600 underline">
            {t('returnHome')}
          </a>
        </div>
      )}
    </div>
  );

}


