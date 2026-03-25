// @ts-check

export function normalizeSvg(svg) {
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  return new XMLSerializer().serializeToString(document);
}
