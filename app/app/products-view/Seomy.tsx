// "use client"

import type { Metadata } from "next";

// async function getProduct(slug: string) {
//   const res = await fetch(`https://api.yourdomain.com/products/${slug}`, {
//     cache: "no-store",
//   });
//   return res.json();
// }

// 🔥 Dynamic SEO
export async function generateMetadata(): Promise<Metadata> {
  // const product = await getProduct(params.slug);

  return {
    title:  " | Buy Online Bangladesh",
    description:'discripos ',

    openGraph: {
      title: 'md ratilte l',
      description: 'dfifldf flkjdf',
      url: `product url `,
      type: "website",
      images: [
        {
          url: 'img url', // 🔥 main image
          width: 1200,
          height: 630,
          alt: 'img alter name',
        },
      ],
    },



    twitter: {
      card: "summary_large_image",
      title: 'name title',
      description: 'product name',
      images: 'img name',
    },

    alternates: {
      canonical: `htm url link product view`,
    },
  };
}


export default function page() {
  return (
    <div>
      <h3>title vprofsd</h3>
    </div>
  )
}
