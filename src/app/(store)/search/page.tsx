import { redirect } from "next/navigation";

export default async function SearchRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rawSearch = params.search ?? params.q ?? params.keyword;
  const search = Array.isArray(rawSearch) ? rawSearch[0] : rawSearch;

  if (!search || !String(search).trim()) {
    redirect("/products");
  }

  redirect(`/products?search=${encodeURIComponent(String(search).trim())}`);
}
