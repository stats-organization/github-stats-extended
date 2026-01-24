import React from "react";
import PropTypes from "prop-types";

import SVG from "./SVG";
import { classnames } from "../../utils";
import { HOST } from "../../constants";

export const Image = ({ imageSrc, stage, compact, extraClasses = "" }) => {
  const fullImageSrc = `https://${HOST}/api${imageSrc}&client=wizard`;

  return (
    <div className={`${extraClasses} relative w-full relative`}>
      <SVG
        className="object-cover"
        url={fullImageSrc}
        compact={compact}
        stage={stage}
      />
    </div>
  );
};

Image.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  stage: PropTypes.number.isRequired,
  compact: PropTypes.bool,
  extraClasses: PropTypes.string,
};

Image.defaultProps = {
  compact: false,
  extraClasses: "",
};

export const Card = ({
  title,
  description,
  imageSrc,
  stage,
  selected,
  compact,
  fixedSize,
}) => {
  return (
    <div
      className={classnames(
        "p-6 rounded border-2",
        fixedSize ? "h-[370px] w-[510px]" : "",
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:bg-gray-50",
      )}
    >
      <h2 className="text-xl font-medium title-font text-gray-900">{title}</h2>
      <p className="text-base leading-relaxed mt-2 mb-4">{description}</p>
      <Image
        imageSrc={imageSrc}
        compact={compact}
        extraClasses={fixedSize ? "flex justify-center" : ""}
        stage={stage}
      />
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  stage: PropTypes.number.isRequired,
  selected: PropTypes.bool,
  compact: PropTypes.bool,
  fixedSize: PropTypes.string,
};

Card.defaultProps = {
  selected: false,
  compact: false,
  fixedSize: false,
};
