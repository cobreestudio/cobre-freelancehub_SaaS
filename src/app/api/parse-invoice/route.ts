// OCR now runs client-side via Tesseract.js — this route is no longer used.
export async function POST() {
  return new Response('Not implemented', { status: 501 })
}
