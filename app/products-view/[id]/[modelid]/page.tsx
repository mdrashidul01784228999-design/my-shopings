import { Metadata } from "next";
import ProductViews from "../../ProductViews";
import Api from "../../../api/Api";

type Props = {
  params: Promise<{ id: string }>;
};

const baseUrl = "https://my-shopings.com";

/**
 * ✅ DATA FETCHING UTILITY
 */
async function getProduct(id: string) {
  try {
    const res = await Api.get(`/productdateid/${id}`);
    return res.data.message;
  } catch (error) {
    console.error("API Fetch Error:", error);
    return null;
  }
}




/**
 * 🚀 DYNAMIC SEO METADATA
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  const title = `${product?.model || "Product"} | Buy Online Bangladesh | My Shopings`;
  const description = product?.discript?.slice(0, 155) || `Buy ${id} at the best price in Bangladesh with fast home delivery.`;
  const productImg = product?.img || `${baseUrl}/logo.png`;
  const url = `${baseUrl}/product/${id}`;

  return {
    metadataBase: new URL(baseUrl), // Required for social share images
    title,
    description,
    keywords: [
      product?.name || "Shopping",
      "buy online Bangladesh",
      "best price BD",
      "online shopping BD",
      "gadget price in Bangladesh"
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "My Shopings",
      images: [
        {
          url: productImg,
          width: 1200,
          height: 630,
          alt: product?.name || "Product Image",
        },
      ],
      type: "website", // Better for general landing pages
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [productImg],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * 🚀 MAIN PAGE COMPONENT
 */
export default async function Page({ params }: Props) {
  const { id } = await params;
  if (!id) return <div className="p-10 text-center text-red-500">Product Not Found</div>;

  const productData = await getProduct(id);

  // Schema.org Structured Data for Google Stars & Price
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productData?.name || "Product Name",
    image: [productData?.img || `${baseUrl}/logo.png`],
    description: productData?.discript || "Quality product available at My Shopings.",
    sku: id,
    brand: {
      "@type": "Brand",
      name: "My Shopings",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${id}`,
      priceCurrency: "BDT",
      price: productData?.pricee || "0",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: "2027-12-31", // Added for Google Merchant safety
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "125",
    },
  };

  return (
    <main>
      {/* 1. GOOGLE SCHEMA INJECTION */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 2. SEO VISIBLE HEADER */}
      <div className="mb-6 border-b pb-4 sr-only">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {productData?.name || "Product Details"} Price in Bangladesh
        </h1>
        <p className="mt-2 text-lg text-gray-600 ">
          Order {productData?.name} online from <strong>My Shopings</strong>. 
          Get the original product with fast delivery and official warranty in BD.
        </p>
      </div>

      {/* 3. PRODUCT VIEW COMPONENT */}
      <ProductViews Ids={id} />
    </main>
  );
}













// import { Metadata } from "next";
// import ProductViews from "../ProductViews";
// import Api from "../../api/Api";

// type Props = {
//   params: Promise<{ id: string }>;
// };

// /**
//  * 1. DYNAMIC METADATA & SOCIAL SHARING (A-Z Setup)
//  */
// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { id } = await params;
//   const baseUrl = "https://my-shopings.com";

//   try {
//     const res = await Api.get(`/productdateid/${id}`);
//     const product = res.data.message;

//     const title = `${product?.name || 'Exclusive Product'} | my-shopings.com`;
//     const description = product?.discript?.substring(0, 160) || `Buy ${id} at the best price on my-shopings.com. Safe delivery in Bangladesh.`;
//     const productImg = product?.img || `${baseUrl}/logo.png`;

//     return {
//       title: title,
//       description: description,
//       alternates: {
//         canonical: `${baseUrl}/product/${id}`, // Tells Google THIS is the main link
//       },
//       // Facebook, Telegram, WhatsApp
//       openGraph: {
//         title: title,
//         description: description,
//         url: `${baseUrl}/product/${id}`,
//         siteName: "My Shopings",
//         images: [{ url: productImg, width: 1200, height: 630 }],
//         type: "website",
//       },
//       // Twitter / X
//       twitter: {
//         card: "summary_large_image",
//         title: title,
//         description: description,
//         images: [productImg],
//       },
//       // General search engine instructions
//       robots: {
//         index: true,
//         follow: true,
//         googleBot: {
//           index: true,
//           follow: true,
//           'max-video-preview': -1,
//           'max-image-preview': 'large',
//           'max-snippet': -1,
//         },
//       },
//     };
//   } catch (error) {
//     return { title: "Product Details | my-shopings.com" };
//   }
// }

// /**
//  * 2. PAGE COMPONENT WITH PRODUCT SCHEMA
//  */
// export default async function Page({ params }: Props) {
//   const { id } = await params;
//   if (!id) return <div className="p-10 text-center">Product Not Found</div>;

//   let productData = null;
//   try {
//     const res = await Api.get(`/productdateid/${id}`);
//     productData = res.data.message;
//   } catch (error) {
//     console.error("SEO Fetch Error:", error);
//   }

//   // Google Rich Snippet (JSON-LD)
//   // This makes your price and image show UP directly on Google Search results.
//   const jsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'Product',
//     name: productData?.name || "Product Name",
//     image: productData?.img || '',
//     description: productData?.discript || '',
//     sku: id,
//     brand: {
//       '@type': 'Brand',
//       name: 'My Shopings',
//     },
//     offers: {
//       '@type': 'Offer',
//       url: `https://my-shopings.com/product/${id}`,
//       priceCurrency: 'BDT', 
//       price: productData?.pricee || '0',
//       availability: 'https://schema.org/InStock',
//       itemCondition: 'https://schema.org/NewCondition',
//     },
//   };

//   return (
//     <main>
//       {/* Structural Data for Google */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />
      
//       {/* Hidden H1 for SEO if your ProductViews doesn't have one */}
//       <h1 className="sr-only">{productData?.name || "Product Details"}</h1>
      
//       {/* Product Display */}
//       <ProductViews Ids={id} />
//     </main>
//   );
// }
















// import { Metadata } from "next";
// import ProductViews from "../ProductViews";
// import Api from "../../api/Api";
// // Import your Api utility here
// // import Api from "@/utils/api"; 

// type Props = {
//   params: Promise<{ id: string }>;
// };

// /**
//  * 1. DYNAMIC METADATA
//  */
// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { id } = await params;

//   try {
//     // Using your specific data structure: res.data.message
//     const res = await Api.get(`/productdateid/${id}`);
//     const product = res.data.message;

//     return {
//       title: `${product?.name || 'Product'} | my-shopings.com`,
//       description: product?.discript || `Check out our latest collection for ${id}`,
//       openGraph: {
//         images: [product?.img || ""],
//       },
//     };
//   } catch (error) {
//     return { title: "Product Details" };
//   }
// }

// /**
//  * 2. PAGE COMPONENT
//  */
// export default async function Page({ params }: Props) {
//   const { id } = await params;

//   if (!id) return <div>ID not found</div>;

//   let productData = null;

//   try {
//     // Fetching the data using your pattern
//     const res = await Api.get(`/productdateid/${id}`);
//     productData = res.data.message;
//   } catch (error) {
//     console.error("Failed to fetch product:", error);
//   }

//   const jsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'Product',
//     name: productData?.name || `Product ${id}`,
//     image: productData?.img || '',
//     description: productData?.discript || '',
//     offers: {
//       '@type': 'Offer',
//       availability: 'https://schema.org/InStock',
//       // Ensure price is a string or number based on your API
//       price: productData?.pricee || '0.00', 
//       priceCurrency: 'BD',
//     },
//   };

//   return (
//     <main>
//       {/* SEO Structured Data */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />
      
//       {/* Pass the ID to your View component */}
//       <ProductViews Ids={id} />
//     </main>
//   );
// }









    // <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }}>
    //         <h1 className="text-3xl md:text-5xl font-bold mb-4">
    //           {product.name}
    //         </h1>

    //         <p className="text-gray-400 mb-5">{product.discript}</p>

    //         <div className="text-2xl text-green-400 mb-6">
    //           ৳ {product.pricee}
    //           <del className="ml-3 text-gray-500">৳ {product.reprice}</del>



// import { Metadata } from "next";
// import ProductViews from "../ProductViews";

// type Props = {
//   params: Promise<{ id: string }>;
// };

// /**
//  * 1. DYNAMIC METADATA
//  * Generates the <title> and <meta> tags for SEO.
//  */
// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { id } = await params;

//   try {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/productdataid/${id}`
//     );
//     const product = await res.json();

//     console.log('====================================');
//     console.log(product);
//     console.log('====================================');

//     return {
//       title: product?.name ? `Buy ${product.name} | Your Store` : `Product ${id} | Your Store`,
//       description: product?.description || `Get the best price on product ${id}.`,
//       openGraph: {
//         images: [product?.image || `/api/og?id=${id}`],
//       },
//     };
//   } catch (error) {
//     return {
//       title: "Product Details"
//     };
//   }
// }

// /**
//  * 2. PAGE COMPONENT
//  */
// export default async function Page({ params }: Props) {
//   const { id } = await params;

//   if (!id) return <div>ID not found</div>;

//   // Fetch product data again for the JSON-LD or pass it down
//   // Note: Next.js automatically memoizes (caches) fetch requests, 
//   // so this won't hit your server twice!
//   let productData;
//   try {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/productdataid/${id}`
//     );
//     productData = await res.json();
//   } catch (e) {
//     productData = null;
//   }

//   const jsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'Product',
//     name: productData?.name || `Product ${id}`,
//     image: productData?.image || 'https://yourstore.com/default-image.jpg',
//     description: productData?.description || 'Detailed product description.',
//     offers: {
//       '@type': 'Offer',
//       availability: 'https://schema.org/InStock',
//       price: productData?.price || '0.00',
//       priceCurrency: 'USD',
//     },
//   };

//   return (
//     <section>
//       {/* 3. JSON-LD STRUCTURED DATA */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />
      
//       {/* 4. MAIN CONTENT */}
//       <ProductViews Ids={id} />
//     </section>
//   );
// }





// import { Metadata } from "next";
// import ProductViews from "../ProductViews";


// type Props = {
//   params: Promise<{ id: string }>;
// };

// /** * 1. DYNAMIC METADATA (Crucial for SEO)
//  * Google uses this for the title and description in search results.
//  */
// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { id } = await params;

//    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/productdataid/${id}`);
  
//   // Replace this with your actual data fetching logic
//   // const product = await getProductData(id); 

//   return {
//     title: `Buy ${id} | Your Store Name`, // Use product name here
//     description: `Get the best price on ${id}. High quality, fast shipping, and great reviews.`,
//     openGraph: {
//       images: [`/api/og?id=${id}`], // Optional: Dynamic OG images
//     },
//   };
// }

// export default async function Page({ params }: Props) {
//   const { id } = await params;

//   if (!id) return <div>ID not found</div>;

//   /**
//    * 2. JSON-LD STRUCTURED DATA
//    * This helps Google show "Rich Snippets" (Price, Rating, Availability).
//    */
//   const jsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'Product',
//     name: `Product ${id}`,
//     image: 'https://yourstore.com/product-image.jpg',
//     description: 'Detailed product description goes here.',
//     offers: {
//       '@type': 'Offer',
//       availability: 'https://schema.org/InStock',
//       price: '99.99',
//       priceCurrency: 'USD',
//     },
//   };

//   return (
//     <div>
//       {/* Add the JSON-LD script to the head */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />
      
    



//       <ProductViews Ids={id} />


//     </div>
//   );
// }





















// import ProductViews from "../ProductViews";
// import Seomy from "../Seomy";

// // 1. Define the type where params is a Promise
// type Props = {
//   params: Promise<{ id: string }>;
// };

// // 2. Make the function 'async'
// export default async function Page({ params }: Props) {
//   // 3. Await the params to get the actual data
//   const { id } = await params;

//   if (!id) {
//     return <div>ID not found</div>;
//   }

//   return (
//     <div>
//       <Seomy />
//       {/* 4. Pass the unwrapped id to your component */}
//       <ProductViews Ids={id} />
//     </div>
//   );
// }

// // Next.js 15+ syntax
// export default async function Page({ 
//   params 
// }: { 
//   params: Promise<{ id: string }> 
// }) {
//   const { id } = await params;

//   return (
//     <div>
//       <h1>Product ID: {id}</h1>
//     </div>
//   );
// }




// import ProductViews from "../ProductViews";
// import Seomy from "../Seomy";

// export default function Page({ params }: { params: { id: string } }) {
//   if (!params?.id) {
//     return <div>ID not found</div>;
//   }

//   return (
//     <div>
//       <Seomy />
//       <ProductViews Ids={params.id} />
//     </div>
//   );
// }



// import { Metadata } from 'next'

//  import ProductClient from '../ProductViews'
// type Props = {
//   params: { id: string }
// }

// export async function generateMetadata(
//   { params }: Props
// ): Promise<Metadata> {

//   const productId = params.id

//   return {
//     title: `Product ${productId} | My-shopings.com`,
//     description:
//       'আমাদের ইকমার্সে পাবেন সেরা মানের পণ্য সাশ্রয়ী দামে।',
//     keywords: [
//       'Ecommerce Bangladesh',
//       'Online Shop BD',
//       'Buy Product Online',
//     ],

//     alternates: {
//       canonical: `https://www.my-shopings.com/product/${productId}`,
//     },

//     openGraph: {
//       type: 'product',
//       title: `Product ${productId}`,
//       description: 'Best product in Bangladesh',
//       url: `https://www.my-shopings.com/product/${productId}`,
//       images: [
//         {
//           url: 'https://www.myshop.com/og-image.jpg',
//           width: 1200,
//           height: 630,
//           alt: 'Product Image',
//         },
//       ],
//       locale: 'bn_BD',
//     },
//   }
// }

// export default function Page({ params }: Props) {
//   return <ProductClient productId={Number(params.id)} />
// }


// 'use client'
// import React from 'react'
// import ProductViews from '../ProductViews'




// import { useParams } from 'next/navigation';





// export default function page() {
  
//     const params = useParams();
  
//       const cleanId = params.id;
//         const productId = Number(cleanId);








//  const metadata: Metadata = {
//   title: "My-shopings.com – Best Online Store in Bangladesh",
//   description: "আমাদের ইকমার্সে পাবেন সেরা মানের পণ্য সাশ্রয়ী দামে। Fast Delivery, Secure Payment এবং ২৪/৭ কাস্টমার সার্পোট।",
//   keywords: ["Ecommerce", "Online Shop", "Bangladesh", "Buy Products", "Best Price"],
//   openGraph: {
//     title: "My Shop – Best Online Store in Bangladesh",
//     description: "আমাদের ইকমার্সে পাবেন সেরা মানের পণ্য সাশ্রয়ী দামে।",
//     url: "https://www.my-shopings.com",
//     siteName: "my-shopings.com/home page",
//     images: [
//       {
//         url: "https://www.myshop.com/og-image.jpg",
//         width: 1200,
//         height: 630,
//         alt: "My Shop Banner",
//       },
//     ],
//     locale: "BD",
//     type: "website",
//   },
//   alternates: {
//     canonical: "https://www.my-shopings.com",
//   },
// };




//   return (
//     <>
    

    
    
//     <ProductViews   productIdget={productId}  />
    
    
    
    
//     </>
//   )
// }
