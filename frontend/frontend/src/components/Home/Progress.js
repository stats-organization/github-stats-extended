/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';

import {
  FaArrowLeft as LeftArrowIcon,
  FaArrowRight as RightArrowIcon,
} from 'react-icons/fa';

import { classnames } from '../../utils';

const ProgressSection = ({ num, item, passed, isActive, onClick }) => {
  return (
    <button
      className={classnames(
        'w-1/4 flex flex-col mx-2 p-2 cursor-pointer',
        passed ? 'border-blue-500' : 'border-gray-500',
        isActive ? 'border-t-[14px] -mt-[5px]' : 'border-t-4',
      )}
      type="button"
      onClick={onClick}
    >
      <div
        className={classnames(
          'text-lg font-bold',
          passed ? 'text-blue-500' : 'text-gray-500',
        )}
      >
        {`Step ${num + 1}`}
      </div>
      <div className={classnames(passed ? 'text-gray-700' : 'text-gray-500')}>
        {item}
      </div>
    </button>
  );
};

ProgressSection.propTypes = {
  num: PropTypes.number.isRequired,
  item: PropTypes.string.isRequired,
  passed: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const ProgressBar = ({ items, currItem, setCurrItem }) => {
  const leftDisabled = currItem === 0;
  const rightDisabled = currItem === items.length - 1;

  return (
    <div className="w-full flex items-center sticky top-0 bg-gray-200 z-50 pt-3 pb-1 px-20 shadow-md">
      <LeftArrowIcon
        className={classnames(
          'w-8 h-8',
          leftDisabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 cursor-pointer',
        )}
        onClick={() => setCurrItem(Math.max(currItem - 1, 0))}
      />
      <div className="px-2 flex-grow flex flex-row">
        {items.map((item, index) => {
          return (
            <ProgressSection
              num={index}
              key={index}
              item={item}
              passed={currItem >= index}
              isActive={currItem === index}
              onClick={() => setCurrItem(index)}
            />
          );
        })}
      </div>
      <RightArrowIcon
        className={classnames(
          'w-8 h-8',
          rightDisabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 cursor-pointer',
        )}
        onClick={() => setCurrItem(Math.min(currItem + 1, items.length - 1))}
      />
    </div>
  );
};

ProgressBar.propTypes = {
  items: PropTypes.array.isRequired,
  currItem: PropTypes.number.isRequired,
  setCurrItem: PropTypes.func.isRequired,
};

export default ProgressBar;
