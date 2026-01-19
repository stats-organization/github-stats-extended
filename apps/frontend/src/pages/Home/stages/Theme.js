/* eslint-disable react/no-array-index-key */

import React from 'react';
import PropTypes from 'prop-types';

import { Card } from '../../../components';
import { themes } from '../../../backend/themes/index';

const ThemeStage = ({ theme, setTheme, setStage, fullSuffix }) => {
  return (
    <>
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
      <div className="pl-10 pr-10">
        For more theme options check the{' '}
        <a
          href="https://github.com/stats-organization/github-stats-extended/blob/master/docs/advanced_documentation.md#themes"
          target="_blank"
          className="underline text-blue-900"
        >
          customization documentation
        </a>{' '}
        after you copied your card URL in step 5.
      </div>
    </>
  );
};

ThemeStage.propTypes = {
  theme: PropTypes.string.isRequired,
  setTheme: PropTypes.func.isRequired,
  setStage: PropTypes.func.isRequired,
  fullSuffix: PropTypes.string.isRequired,
};

export default ThemeStage;
