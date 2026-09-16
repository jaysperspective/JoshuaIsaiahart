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

// ---------- Social / vertical (9:16) video support ----------

export type SocialPlatform = 'tiktok' | 'instagram' | 'youtube' | 'direct' | null;

export interface ParsedSocial {
  platform: SocialPlatform;
  id: string | null;
  originalUrl: string;
}

/**
 * Parse a social video URL (TikTok, Instagram Reel, YouTube Short, or direct file)
 */
export function parseSocialUrl(url: string): ParsedSocial {
  if (!url) {
    return { platform: null, id: null, originalUrl: url };
  }

  const tiktokMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (tiktokMatch) {
    return { platform: 'tiktok', id: tiktokMatch[1], originalUrl: url };
  }

  const instagramMatch = url.match(/instagram\.com\/(?:[^/]+\/)?(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
  if (instagramMatch) {
    return { platform: 'instagram', id: instagramMatch[1], originalUrl: url };
  }

  const parsed = parseVideoUrl(url);
  if (parsed.service === 'youtube') {
    return { platform: 'youtube', id: parsed.id, originalUrl: url };
  }
  if (parsed.service === 'direct') {
    return { platform: 'direct', id: null, originalUrl: url };
  }

  return { platform: null, id: null, originalUrl: url };
}

/**
 * Generate an embed URL for a social video
 */
export function getSocialEmbedUrl(parsed: ParsedSocial): string | null {
  switch (parsed.platform) {
    case 'tiktok':
      return `https://www.tiktok.com/embed/v2/${parsed.id}`;
    case 'instagram':
      return `https://www.instagram.com/reel/${parsed.id}/embed`;
    case 'youtube':
      return `https://www.youtube.com/embed/${parsed.id}?autoplay=1&playsinline=1`;
    case 'direct':
      return parsed.originalUrl;
    default:
      return null;
  }
}

/**
 * Check if a URL is a supported social video URL
 */
export function isValidSocialUrl(url: string): boolean {
  return parseSocialUrl(url).platform !== null;
}
