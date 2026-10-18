import reviewedCovers from "../../../data/property-covers.json";
import watermarks from "../../../data/property-watermarks.json";

const covers: Readonly<Record<string, string>> = reviewedCovers;
const variants: Readonly<Record<string, { url: string }>> = watermarks.images;

/** Use the reviewed exterior first everywhere, retaining the rest of the gallery. */
export function orderPropertyImages(id: string, images: readonly string[]): string[] {
  const cover = covers[id];
  const index = cover ? images.indexOf(cover) : -1;
  // A stale selection must never introduce an image outside this listing's gallery.
  const ordered = index <= 0
    ? [...images]
    : [images[index], ...images.slice(0, index), ...images.slice(index + 1)];
  return ordered.map(image => variants[image]?.url ?? image);
}
