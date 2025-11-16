/* eslint-disable react/no-array-index-key */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Card } from '../../../components';
import { classnames } from '../../../utils';
import {
  GITHUB_PRIVATE_AUTH_URL,
  GITHUB_PUBLIC_AUTH_URL,
  HOST,
} from '../../../constants';
import { FaGithub as GithubIcon } from 'react-icons/fa';
import { logout as _logout } from '../../../redux/actions/userActions';

const LoginStage = ({ setCurrItem }) => {
  const userId = useSelector((state) => state.user.userId);
  const userKey = useSelector((state) => state.user.userKey);
  const privateAccess = useSelector((state) => state.user.privateAccess);
  const isAuthenticated = userId && userId.length > 0;

  const dispatch = useDispatch();
  const logout = () => {
    dispatch(_logout());
  };

  // Card data
  const cards = [
    {
      title: 'GitHub Stats Card',
      description: 'your overall GitHub statistics',
      imageSrc: `?&username=anuraghazra`,
      demoCustomization: '&include_all_commits=true',
      cardType: 'stats',
    },
    {
      title: 'Top Languages Card',
      description: 'your most frequently used languages',
      imageSrc: `/top-langs?&username=anuraghazra`,
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
  ];

  // Animation state for each card
  const [cardOffsets, setCardOffsets] = useState(
    cards.map(() => ({ x: 0, y: 0 })),
  );

  // Subtle floating animation
  useEffect(() => {
    const intervals = cards.map((_, index) => {
      return setInterval(() => {
        setCardOffsets((prev) => {
          const newOffsets = [...prev];
          newOffsets[index] = {
            x: Math.sin(Date.now() / 1000 + index) * 3,
            y: Math.cos(Date.now() / 1500 + index * 0.5) * 3,
          };
          return newOffsets;
        });
      }, 50);
    });

    return () => intervals.forEach(clearInterval);
  }, []);
  return (
    <div className="h-full flex flex-wrap">
      <div className="hidden lg:block lg:w-3/5 lg:p-8 lg:my-auto">
        <div
          className={classnames(
            'bg-gray-200 rounded-sm w-full h-full m-auto p-8 shadow',
            'lg:h-auto',
          )}
        >
          {isAuthenticated ? (
            <>
              {/* User is logged in */}
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2">
                  You are logged in as{' '}
                  <a
                    href={`https://github.com/${userId}`}
                    target="_blank"
                    className="text-blue-500 hover:underline font-semibold"
                  >
                    {userId}
                  </a>
                  .
                </p>
                <p className="text-gray-600">
                  Access Level:{' '}
                  <strong>
                    {privateAccess ? 'Private Access' : 'Public Access'}
                  </strong>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {privateAccess
                    ? 'You have granted access to both public and private repositories.'
                    : 'You have granted access to public repositories.'}
                </p>
              </div>

              {/* Access Level Management Buttons */}
              <div className="mb-4">
                {privateAccess ? (
                  <div className="flex items-center gap-4">
                    <a
                      href={`https://${HOST}/api/downgrade?user_key=${userKey}`}
                    >
                      <Button className="h-12 flex justify-center items-center w-[260px] text-black border border-black bg-white hover:bg-gray-100">
                        <GithubIcon className="w-6 h-6" />
                        <span className="xl:text-lg">
                          Downgrade to Public Access
                        </span>
                      </Button>
                    </a>
                    <p className="text-sm text-gray-600 flex-1">
                      Switch to public access if you prefer not to share private
                      repository data.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <a href={GITHUB_PRIVATE_AUTH_URL}>
                      <Button className="h-12 flex justify-center items-center w-[260px] text-white bg-blue-500 hover:bg-blue-600">
                        <GithubIcon className="w-6 h-6" />
                        <span className="xl:text-lg">
                          Upgrade to Private Access
                        </span>
                      </Button>
                    </a>
                    <p className="text-sm text-gray-600 flex-1">
                      Upgrade to include contributions from your private
                      repositories for more complete stats.
                    </p>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <div className="mt-6 flex items-center gap-4">
                <Button
                  className="h-12 flex justify-center items-center w-[260px] text-black border border-black bg-white hover:bg-gray-100"
                  onClick={logout}
                >
                  <span className="xl:text-lg">Log Out</span>
                </Button>
                <p className="text-sm text-gray-600 flex-1">
                  Log out from your GitHub account.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* User is not logged in - show login options */}
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2">
                  You are not logged in.
                </p>
                <p className="text-sm text-gray-500">
                  Please choose an option below to continue.
                </p>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <a href={GITHUB_PUBLIC_AUTH_URL}>
                  <Button className="h-12 flex justify-center items-center w-[260px] text-white bg-blue-500 hover:bg-blue-600">
                    <GithubIcon className="w-6 h-6" />
                    <span className="ml-2 xl:text-lg">
                      GitHub Public Access
                    </span>
                  </Button>
                </a>
                <p className="text-sm text-gray-600 flex-1">
                  Generate stats based on your public repositories.
                </p>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <a href={GITHUB_PRIVATE_AUTH_URL}>
                  <Button className="h-12 flex justify-center items-center w-[260px] text-black border border-black bg-white hover:bg-gray-100">
                    <GithubIcon className="w-6 h-6" />
                    <span className="ml-2 xl:text-lg">
                      GitHub Private Access
                    </span>
                  </Button>
                </a>
                <p className="text-sm text-gray-600 flex-1">
                  Includes contributions in your private repositories for more
                  complete and accurate stats.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  className="h-12 flex justify-center items-center w-[260px] text-black border border-black bg-white hover:bg-gray-100"
                  onClick={() => setCurrItem(1)}
                >
                  <span className="ml-2 xl:text-lg">Continue as Guest</span>
                </Button>
                <p className="text-sm text-gray-600 flex-1">
                  Try out Github Trends with data from an example
                  user/repository.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="w-full h-full lg:w-2/5 flex lg:flex-col lg:p-8 relative overflow-hidden">
        <div className="relative w-full h-full">
          {cards.map((card, index) => {
            // Calculate arch position
            // Arch center is far to the right (1500px to the right)
            // Radius of the arch
            const radius = 800;
            const centerX = 1500;
            const centerY = 300;

            // Angle for each card (spreading them in an arch)
            // Cards arranged from top-left to bottom-left
            const startAngle = Math.PI * 0.75; // ~135 degrees
            const endAngle = Math.PI * 1.25; // ~225 degrees
            const angle =
              startAngle +
              (endAngle - startAngle) * (index / (cards.length - 1));

            // Calculate position on the arch
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            // Add animation offset
            const animX = x + cardOffsets[index].x;
            const animY = y + cardOffsets[index].y;

            return (
              <div
                key={index}
                className="absolute transition-all duration-100 ease-out"
                style={{
                  left: `${animX}px`,
                  top: `${animY}px`,
                  transform: 'translate(-50%, -50%)',
                  width: '280px',
                }}
              >
                <Card
                  title={card.title}
                  description={card.description}
                  imageSrc={card.imageSrc + card.demoCustomization}
                  selected={false}
                  fixedSize="true"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-wrap">
      {[
        {
          title: 'GitHub Stats Card',
          description: 'your overall GitHub statistics',
          imageSrc: `?&username=${userId}`,
          demoCustomization: '&include_all_commits=true',
          cardType: 'stats',
        },
        {
          title: 'Top Languages Card',
          description: 'your most frequently used languages',
          imageSrc: `/top-langs?&username=${userId}`,
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

LoginStage.propTypes = {
  setCurrItem: PropTypes.func.isRequired,
};

export default LoginStage;
