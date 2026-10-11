// src/lib/compress.ts
export async function compressImage(file: File, maxSide = 1600) {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    bmp = await createImageBitmap(file);
  }

  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, width, height);
  bmp.close();

  const toBlob = (type: string, q: number) =>
    new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));

  let blob = await toBlob("image/webp", 0.8);
  let ext: "webp" | "jpg" = "webp";
  if (!blob || blob.type !== "image/webp") {
    blob = await toBlob("image/jpeg", 0.82); // algunos Safari no codifican WebP
    ext = "jpg";
  }
  if (!blob) throw new Error("No pudimos procesar la imagen.");

  return { blob, width, height, ext };
}