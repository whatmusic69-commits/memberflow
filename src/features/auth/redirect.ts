/** Only workspace paths can be a post-login destination; never accept another origin. */
export function safeAuthRedirect(value: string | undefined): string {
  if (!value) return "/dashboard";
  try {
    const decoded = decodeURIComponent(value);
    if (
      !decoded.startsWith("/") ||
      decoded.startsWith("//") ||
      /[\\\u0000-\u0020]/.test(decoded)
    )
      return "/dashboard";
    const url = new URL(decoded, "https://memberflow.invalid");
    if (
      url.origin !== "https://memberflow.invalid" ||
      !/^\/(?:en\/|lv\/|ru\/)?(?:dashboard|staff)(?:\/|$)/.test(url.pathname)
    )
      return "/dashboard";
    const localized = url.pathname.match(
      /^\/(en|lv|ru)(\/(?:dashboard|staff)(?:\/.*)?)$/,
    );
    if (localized) {
      url.pathname = localized[2];
      if (!url.searchParams.has("lang"))
        url.searchParams.set("lang", localized[1]);
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}
