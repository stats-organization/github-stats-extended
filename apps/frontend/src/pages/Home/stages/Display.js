/* eslint-disable react/no-array-index-key */

import React from "react";
import PropTypes from "prop-types";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { saveSvgAsPng } from "save-svg-as-png";

import { Button } from "../../../components/Generic/Button";
import { Image } from "../../../components/Card/Card";
import { classnames } from "../../../utils";
import { HOST } from "../../../constants";

const DisplayStage = ({ filename, link, themeSuffix, guestHint }) => {
  const downloadPNG = () => {
    saveSvgAsPng(
      document.getElementById("svgWrapper").shadowRoot.firstElementChild
        .firstElementChild,
      `${filename}.png`,
      {
        scale: 2,
        encoderOptions: 1,
      },
    );
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(
      `[![GitHub Stats](https://${HOST}/api${themeSuffix})](${link})`,
    );
    toast.info("Copied to Clipboard!", {
      position: "bottom-right",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(`https://${HOST}/api${themeSuffix}`);
    toast.info("Copied to Clipboard!", {
      position: "bottom-right",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });
  };

  return (
    <div className="w-full flex flex-wrap">
      <div className="h-auto lg:w-2/5 md:w-1/2">
        <div className="p-10 rounded-sm bg-gray-200">
          <div className="flex flex-col items-center">
            {[
              {
                title: "Copy Markdown",
                highlight: true,
                onClick: copyMarkdown,
              },
              { title: "Copy URL", highlight: false, onClick: copyUrl },
              { title: "Download PNG", highlight: false, onClick: downloadPNG },
            ].map((item, index) => (
              <Button
                key={index}
                className={classnames(
                  "m-4 w-60 flex justify-center",
                  item.highlight
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-100 text-black",
                )}
                onClick={item.onClick}
              >
                {item.title}
              </Button>
            ))}
          </div>
          {guestHint && <div className="pt-10 pl-10 pr-10">{guestHint}</div>}
        </div>
      </div>
      <div className="w-full lg:w-3/5 md:w-1/2 object-center pt-5 md:pt-0 pl-0 md:pl-5 lg:pl-0">
        <div className="w-full lg:w-3/5 mx-auto flex flex-col justify-center sticky top-32">
          <Image
            imageSrc={`${themeSuffix}&disable_animations=true`}
            stage={4}
          />
        </div>
      </div>
    </div>
  );
};

DisplayStage.propTypes = {
  filename: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  themeSuffix: PropTypes.string.isRequired,
  guestHint: PropTypes.string.isRequired,
};

export default DisplayStage;
