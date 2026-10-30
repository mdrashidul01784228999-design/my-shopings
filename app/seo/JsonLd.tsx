// যেকোনো সার্ভার কম্পোনেন্ট/layout-এ ব্যবহার: <JsonLd data={{...}} />
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
