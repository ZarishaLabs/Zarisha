/**
 * Minimal stub for @vercel/og to keep the Worker bundle under Cloudflare's 3 MiB free tier.
 * The app does not use dynamic OG image generation (ImageResponse).
 * Exporting a no-op so Next's server trace does not pull in the real ~2.2 MiB library.
 */

export class ImageResponse extends Response {
  constructor(...args) {
    super(null, {
      status: 501,
      headers: { 'content-type': 'text/plain' },
    });
  }
}

export async function experimental_FigmaImageResponse() {
  return new ImageResponse();
}
