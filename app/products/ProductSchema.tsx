export default function ProductSchema({ product }: any) {
  const siteUrl = "https://yourdomain.com";

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product?.name,
          image: product?.img
            ? `${siteUrl}/uploads_product/${product.img}`
            : `${siteUrl}/og.png`,
          description: product?.discript,
          offers: {
            "@type": "Offer",
            price: product?.pricee,
            priceCurrency: "BDT",
            availability: "https://schema.org/InStock",
            url: siteUrl,
          },
        }),
      }}
    />
  );
}