/* eslint-disable react/no-array-index-key */

import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { Card } from '../../../components';

const SelectCardStage = ({ selectedCard, setSelectedCard, setImageSrc }) => {
  const userId = useSelector((state) => state.user.userId);
  return (
    <div className="w-full flex flex-wrap">
      {[
        {
          title: 'GitHub Stats Card',
          description: 'your overall GitHub statistics',
          imageSrc: `?username=${userId}`,
          demoCustomization: '&include_all_commits=true',
          cardType: 'stats',
        },
        {
          title: 'Top Languages Card',
          description: 'your most frequently used languages',
          imageSrc: `/top-langs?username=${userId}`,
          demoCustomization: '&langs_count=4',
          cardType: 'top-langs',
        },
        {
          title: 'GitHub Extra Pin',
          description:
            'pin more than 6 repositories in your profile using a GitHub profile readme',
          imageSrc: '/pin?repo=anuraghazra/github-readme-stats',
          demoCustomization: '',
          cardType: 'pin',
        },
        {
          title: 'GitHub Gist Pin',
          description:
            'pin gists in your GitHub profile using a GitHub profile readme',
          imageSrc: '/gist?id=bbfce31e0217a3689c8d961a356cb10d',
          demoCustomization: '',
          cardType: 'gist',
        },
        {
          title: 'WakaTime Stats Card',
          description: 'your coding activity from WakaTime',
          imageSrc: '/wakatime?username=ffflabs',
          demoCustomization: '&langs_count=6&card_width=450',
          cardType: 'wakatime',
        },
      ].map((card, index) => (
        <button
          className="p-2 lg:p-4"
          key={index}
          type="button"
          onClick={() => {
            setSelectedCard(card.cardType);
            setImageSrc(card.imageSrc);
          }}
        >
          <Card
            title={card.title}
            description={card.description}
            imageSrc={card.imageSrc + card.demoCustomization}
            selected={selectedCard === card.cardType}
            fixedSize="true"
          />
        </button>
      ))}
    </div>
  );
};

SelectCardStage.propTypes = {
  selectedCard: PropTypes.string,
  setSelectedCard: PropTypes.func.isRequired,
  setImageSrc: PropTypes.func.isRequired,
};

SelectCardStage.defaultProps = {
  selectedCard: null,
};

export default SelectCardStage;
