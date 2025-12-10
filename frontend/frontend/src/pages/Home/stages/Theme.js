/* eslint-disable react/no-array-index-key */

import React from 'react';
import PropTypes from 'prop-types';

import { Card } from '../../../components';
import { themes } from '../../../backend/themes/index';

const ThemeStage = ({ theme, setTheme, setStage, fullSuffix }) => {
  return (
    <div className="flex flex-wrap">
      {Object.keys(themes)
        .filter(
          (myTheme) =>
            ![
              'merko',
              'blue-green',
              'gotham',
              'blueberry',
              'outrun',
              'holi',
            ].includes(myTheme),
        )
        .map((myTheme, index) => (
          <button
            className="p-2 lg:p-4"
            key={index}
            type="button"
            onClick={() => {
              setTheme(myTheme);
              setStage(4);
            }}
          >
            <Card
              title={myTheme}
              description=""
              imageSrc={`${fullSuffix}&theme=${myTheme}`}
              selected={theme === myTheme}
              stage={3}
            />
          </button>
        ))}
    </div>
  );
};

ThemeStage.propTypes = {
  theme: PropTypes.string.isRequired,
  setTheme: PropTypes.func.isRequired,
  setStage: PropTypes.func.isRequired,
  fullSuffix: PropTypes.string.isRequired,
};

export default ThemeStage;
