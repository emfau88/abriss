export function publicAssetPath(
  relativePath: string,
  baseUrl = import.meta.env.BASE_URL,
): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = relativePath.replace(/^\/+/, "");
  return `${normalizedBase}${normalizedPath}`;
}
