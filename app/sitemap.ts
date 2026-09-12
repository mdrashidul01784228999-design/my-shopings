import  siteUrl  from "./api/Api";
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Fetch products with an optional 'limit' if your store is massive
  // Use 'revalidate' to ensure the sitemap stays fresh without hitting the DB too hard
  const res = await fetch(`${siteUrl}/api/products`, {
    next: { revalidate: 3600 } 
  });
  
  const products = await res.json();

  const productUrls = products.map((p: any) => ({
    url: `${siteUrl}/product/${p.id}`,
    // 2. Use actual update dates if available, otherwise fallback to now
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8, // Products are high priority
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // Homepage is highest priority
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3, // Login pages don't need much SEO love
    },
    ...productUrls,
  ];
}

// import { siteUrl } from "./api/Api";

// export default async function sitemap() {
//   const res = await fetch(`${siteUrl}/api/products`);
//   const products = await res.json();

//   const productUrls = products.map((p: any) => ({
//     url: `${siteUrl}/product/${p.id}`,
//     lastModified: new Date(),
//   }));

//   return [
//     {
//       url: siteUrl,
//       lastModified: new Date(),
//     },
//     {
//       url: `${siteUrl}/login`,
//       lastModified: new Date(),
//     },
//     ...productUrls,
//   ];
// }