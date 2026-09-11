const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

export const DEFAULT_PLAYER_PHOTO = "https://images.unsplash.com/photo-1624194686522-83788533d11b?q=80&w=800&auto=format&fit=crop";

/**
 * Resolves player photos and team logos into fully-qualified accessible URLs.
 * Handles relative paths (/uploads/players/...), base64 strings, and absolute HTTP(S) URLs.
 */
export function getImageUrl(path: string | null | undefined, fallback: string = DEFAULT_PLAYER_PHOTO): string {
  if (!path || !path.trim()) {
    return fallback;
  }

  const trimmed = path.trim();

  // If already absolute URL or base64 data string, return as-is
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Relative upload paths like /uploads/players/xyz.jpg or uploads/players/xyz.jpg
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${BACKEND_URL}${normalizedPath}`;
}
