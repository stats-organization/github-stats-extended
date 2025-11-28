/* eslint-disable react/no-array-index-key */

import React from 'react';
import PropTypes from 'prop-types';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { saveSvgAsPng } from 'save-svg-as-png';

import { Button, Card } from '../../../components';
import { classnames } from '../../../utils';
import { HOST } from '../../../constants';

const DisplayStage = ({ userId, themeSuffix }) => {
  const card = themeSuffix.split('?')[0];

  const downloadPNG = () => {
    saveSvgAsPng(
      document.getElementById('svgWrapper').shadowRoot.firstElementChild
        .firstElementChild,
      `${userId}_${card}.png`,
      {
        scale: 2,
        encoderOptions: 1,
      },
    );
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(
      `[![GitHub Stats](https://${HOST}/api${themeSuffix})](https://${HOST}/api${themeSuffix})`,
    );
    toast.info('Copied to Clipboard!', {
      position: 'bottom-right',
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(`https://${HOST}/api${themeSuffix}`);
    toast.info('Copied to Clipboard!', {
      position: 'bottom-right',
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
    });
  };

  return (
    <div className="w-full flex flex-wrap">
      <ToastContainer />
      <div className="h-auto lg:w-2/5 md:w-1/2">
        <div className="pr-10 p-10 rounded-sm bg-gray-200">
          <div className="flex flex-col items-center">
            {[
              {
                title: 'Copy Markdown',
                highlight: true,
                onClick: copyMarkdown,
              },
              { title: 'Copy URL', highlight: false, onClick: copyUrl },
              { title: 'Download PNG', highlight: false, onClick: downloadPNG },
            ].map((item, index) => (
              <Button
                key={index}
                className={classnames(
                  'm-4 w-60 flex justify-center',
                  item.highlight
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-500',
                )}
                onClick={item.onClick}
              >
                {item.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-3/5 md:w-1/2 object-center pt-5 md:pt-0 pl-0 md:pl-5 lg:pl-0">
        <div className="w-full lg:w-[65%] mx-auto h-full flex flex-col justify-center">
          <Card
            title="Your Card"
            description="The finished product!"
            imageSrc={`${themeSuffix}&disable_animations=true`}
          />
        </div>
      </div>
    </div>
  );
};

DisplayStage.propTypes = {
  userId: PropTypes.string.isRequired,
  themeSuffix: PropTypes.string.isRequired,
};

export default DisplayStage;
