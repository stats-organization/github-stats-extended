/**
 * Convert a self-contained SVG element to a PNG and hand it to the browser as a download.
 * The card SVGs carry their own `<style>` and reference no external assets,
 * so serializing the element is enough.
 *
 * @param svg The `<svg>` element to convert.
 * @param filename Name given to the downloaded file.
 * @param scale Pixel multiplier applied to the SVG's own dimensions.
 */
export async function downloadSvgAsPng(
  svg: SVGSVGElement,
  filename: string,
  scale = 2,
): Promise<void> {
  const width = svg.width.baseVal.value || svg.viewBox.baseVal.width;
  const height = svg.height.baseVal.value || svg.viewBox.baseVal.height;

  const source = new XMLSerializer().serializeToString(svg);
  const image = new Image(width, height);

  await new Promise<void>((resolve, reject) => {
    image.onload = () => {
      resolve();
    };
    image.onerror = () => {
      reject(new Error("The card could not be rendered as an image."));
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("This browser does not provide a 2D canvas context.");
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
  if (!blob) {
    throw new Error("The card could not be encoded as a PNG.");
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
