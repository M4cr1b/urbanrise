import reviewedCovers from "../../../data/property-covers.json";

const covers: Readonly<Record<string, string>> = reviewedCovers;

/** Use the reviewed exterior first everywhere, retaining the rest of the gallery. */
export function orderPropertyImages(id: string, images: readonly string[]): string[] {
  const cover = covers[id];
  const index = cover ? images.indexOf(cover) : -1;
  // A stale selection must never introduce an image outside this listing's gallery.
  if (index <= 0) return [...images];
  return [images[index], ...images.slice(0, index), ...images.slice(index + 1)];
}
