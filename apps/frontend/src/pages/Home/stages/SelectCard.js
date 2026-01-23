/* eslint-disable react/no-array-index-key */

import React from "react";
import PropTypes from "prop-types";

import { Card } from "../../../components/Card/Card";
import { useUserId } from "../../../redux/selectors/userSelectors";
import {
  DEMO_GIST,
  DEMO_REPO,
  DEMO_USER,
  DEMO_WAKATIME_USER,
} from "../../../constants";
import { CardTypes } from "../../../utils";

const SelectCardStage = ({ selectedCard, setSelectedCard, setStage }) => {
  return (
    <div className="w-full flex flex-wrap">
      {[
        {
          title: "GitHub Stats Card",
          description: "your overall GitHub statistics",
          demoImageSrc: `?username=${useUserId(DEMO_USER)}&include_all_commits=true`,
          cardType: CardTypes.STATS,
        },
        {
          title: "Top Languages Card",
          description: "your most frequently used languages",
          demoImageSrc: `/top-langs?username=${useUserId(DEMO_USER)}&langs_count=4`,
          cardType: CardTypes.TOP_LANGS,
        },
        {
          title: "GitHub Extra Pin",
          description:
            "pin more than 6 repositories in your profile using a GitHub profile readme",
          demoImageSrc: `/pin?repo=${DEMO_REPO}`,
          cardType: CardTypes.PIN,
        },
        {
          title: "GitHub Gist Pin",
          description:
            "pin gists in your GitHub profile using a GitHub profile readme",
          demoImageSrc: `/gist?id=${DEMO_GIST}`,
          cardType: CardTypes.GIST,
        },
        {
          title: "WakaTime Stats Card",
          description: "your coding activity from WakaTime",
          demoImageSrc: `/wakatime?username=${DEMO_WAKATIME_USER}&langs_count=6&card_width=450`,
          cardType: CardTypes.WAKATIME,
        },
      ].map((card, index) => (
        <button
          className="p-2 lg:p-4"
          key={index}
          type="button"
          onClick={() => {
            setSelectedCard(card.cardType);
            setStage(2);
          }}
        >
          <Card
            title={card.title}
            description={card.description}
            imageSrc={card.demoImageSrc}
            selected={selectedCard === card.cardType}
            fixedSize="true"
            stage={1}
          />
        </button>
      ))}
    </div>
  );
};

SelectCardStage.propTypes = {
  selectedCard: PropTypes.string,
  setSelectedCard: PropTypes.func.isRequired,
  setStage: PropTypes.func.isRequired,
};

SelectCardStage.defaultProps = {
  selectedCard: null,
};

export default SelectCardStage;
