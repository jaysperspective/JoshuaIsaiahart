// Video URL parsing and embed utilities

export type VideoService = 'youtube' | 'vimeo' | 'direct' | null;

export interface ParsedVideo {
  service: VideoService;
  id: string | null;
  originalUrl: string;
}

/**
 * Parse a video URL to extract the service and video ID
 */
export function parseVideoUrl(url: string): ParsedVideo {
  if (!url) {
    return { service: null, id: null, originalUrl: url };
  }

  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return { service: 'youtube', id: match[1], originalUrl: url };
    }
  }

  // Vimeo patterns
  const vimeoPatterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern);
    if (match) {
      return { service: 'vimeo', id: match[1], originalUrl: url };
    }
  }

  // Check if it's a direct video URL
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return { service: 'direct', id: null, originalUrl: url };
  }

  return { service: null, id: null, originalUrl: url };
}

/**
 * Generate an embed URL for the video
 */
export function getEmbedUrl(parsed: ParsedVideo): string | null {
  if (!parsed.service) return null;

  switch (parsed.service) {
    case 'youtube':
      return `https://www.youtube.com/embed/${parsed.id}?autoplay=1`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${parsed.id}?autoplay=1`;
    case 'direct':
      return parsed.originalUrl;
    default:
      return null;
  }
}

/**
 * Get a thumbnail URL for the video
 */
export function getThumbnailUrl(parsed: ParsedVideo): string | null {
  if (!parsed.service) return null;

  switch (parsed.service) {
    case 'youtube':
      // YouTube provides predictable thumbnail URLs
      return `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`;
    case 'vimeo':
      // Vimeo requires API call for thumbnails, return null to use placeholder
      return null;
    case 'direct':
      // Direct videos don't have thumbnails
      return null;
    default:
      return null;
  }
}

/**
 * Check if a URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  const parsed = parseVideoUrl(url);
  return parsed.service !== null;
}
