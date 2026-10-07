import { redirect } from "next/navigation";
/** Compatibility entry. Symfony must map existing stable QR aliases to current slugs. */
export default async function LegacyJoin({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { publicId } = await params,
    query = await searchParams;
  const search = new URLSearchParams();
  if (typeof query.lang === "string") search.set("lang", query.lang);
  redirect(
    `/b/${encodeURIComponent(publicId)}${search.size ? `?${search}` : ""}`,
  );
}
