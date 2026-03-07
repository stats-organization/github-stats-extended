// @ts-check

/**
 * Encode string as HTML.
 *
 * @see https://stackoverflow.com/a/48073476/10629172
 *
 * @param {string} str String to encode.
 * @returns {string} Encoded string.
 */
const encodeHTML = (str) => {
  return (
    str
      .replace(/[\u00A0-\u9999<>&](?!#)/gim, (i) => {
        return "&#" + i.charCodeAt(0) + ";";
      })
      // eslint-disable-next-line no-control-regex
      .replace(/\u0008/gim, "")
  );
};

export { encodeHTML };
