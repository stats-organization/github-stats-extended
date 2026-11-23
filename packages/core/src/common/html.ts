/**
 * Encode string as HTML.
 *
 * @see https://stackoverflow.com/a/48073476/10629172
 */
const encodeHTML = (str: string): string => {
  return (
    str
      .replace(
        /[<>"']|&(?!#(?:[0-9]+|x[0-9a-fA-F]+);)|[\u00A0-\u9999]/gim,
        (i: string) => {
          return `&#${i.charCodeAt(0)};`;
        },
      )
      // eslint-disable-next-line no-control-regex
      .replace(/\u0008/gim, "")
  );
};

export { encodeHTML };
