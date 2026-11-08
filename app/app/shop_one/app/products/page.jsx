import ProductsList from "../../components/ProductsList";
import { getProducts } from "../../lib/db";
import { isAdmin } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  return <ProductsList products={await getProducts()} admin={isAdmin()} />;
}
