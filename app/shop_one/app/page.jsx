import Landing from "../components/Landing";
import Faq from "../components/Faq";

export const metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Landing />
      <Faq />
    </>
  );
}
