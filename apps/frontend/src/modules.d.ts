declare module "*.css";

declare module "*.png" {
  const img: string;
  export default img;
}

// This package doesn't have a @types counter part
declare module "save-svg-as-png" {
  const saveSvgAsPng: (
    element: Element,
    filename: string,
    options: {
      scale: number;
      encoderOptions: number;
    },
  ) => void;
  export { saveSvgAsPng };
}
