/* eslint-disable react/no-array-index-key */

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Button, Image } from '../../../components';
import { classnames } from '../../../utils';
import {
  CLIENT_ID,
  GITHUB_PRIVATE_AUTH_URL,
  GITHUB_PUBLIC_AUTH_URL,
  HOST,
} from '../../../constants';
import { FaGithub as GithubIcon } from 'react-icons/fa';
import { logout as _logout } from '../../../redux/actions/userActions';
import {
  useIsAuthenticated,
  usePrivateAccess,
  useUserId,
  useUserKey,
} from '../../../redux/selectors/userSelectors';
import { deleteAccount } from '../../../api';

const LoginStage = ({ setCurrItem }) => {
  const userId = useUserId();
  const userKey = useUserKey();
  const privateAccess = usePrivateAccess();
  const isAuthenticated = useIsAuthenticated();

  const dispatch = useDispatch();
  const logout = () => {
    dispatch(_logout());
  };
  const deleteAccountHandler = async (myUserId, myUserKey) => {
    const success = await deleteAccount(myUserId, myUserKey);
    if (success) {
      logout();
      window.location = `https://github.com/settings/connections/applications/${CLIENT_ID}`;
    }
  };

  // Card data
  const cards = [
    {
      imageSrc: '/pin?repo=anuraghazra/github-readme-stats',
      demoCustomization: '&disable_animations=true',
    },
    {
      imageSrc: '/top-langs?username=anuraghazra',
      demoCustomization: '&langs_count=4&disable_animations=true',
    },
    {
      imageSrc: '?username=anuraghazra',
      demoCustomization: '&include_all_commits=true&disable_animations=true',
    },
    {
      imageSrc: '/wakatime?username=ffflabs',
      demoCustomization:
        '&langs_count=6&card_width=450&disable_animations=true',
    },
    {
      imageSrc: '/gist?id=bbfce31e0217a3689c8d961a356cb10d',
      demoCustomization: '&disable_animations=true',
    },
  ];

  return (
    <div className="h-full flex flex-wrap">
      <div className="hidden lg:block lg:w-3/5 lg:p-8">
        <div
          className={classnames(
            'bg-gray-200 rounded-sm w-full h-full m-auto p-8 shadow',
            'lg:h-auto',
          )}
        >
          {isAuthenticated ? (
            <>
              {/* Access Level Management Buttons */}
              <div className="mb-4">
                {privateAccess ? (
                  <div className="flex items-center gap-4">
                    <a
                      href={`https://${HOST}/api/downgrade?user_key=${userKey}`}
                    >
                      <Button className="h-12 flex justify-center items-center w-[320px] text-black border border-black bg-white hover:bg-gray-100">
                        <GithubIcon className="w-6 h-6" />
                        <span className="ml-2 xl:text-lg">
                          Downgrade to Public Access
                        </span>
                      </Button>
                    </a>
                    <p className="text-sm text-gray-600 flex-1">
                      Switch to public access if you prefer not to share private
                      contributions.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <a href={GITHUB_PRIVATE_AUTH_URL}>
                      <Button className="h-12 flex justify-center items-center w-[320px] text-white bg-blue-500 hover:bg-blue-600">
                        <GithubIcon className="w-6 h-6" />
                        <span className="ml-2 xl:text-lg">
                          Upgrade to Private Access
                        </span>
                      </Button>
                    </a>
                    <p className="text-sm text-gray-600 flex-1">
                      Upgrade to include contributions in private repositories
                      for more complete and accurate stats.
                    </p>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <div className="mt-6 flex items-center gap-4">
                <Button
                  className="h-12 flex justify-center items-center w-[320px] text-black border border-black bg-white hover:bg-gray-100"
                  onClick={logout}
                >
                  <span className="xl:text-lg">Log Out</span>
                </Button>
                <p className="text-sm text-gray-600 flex-1">
                  Log out from GitHub Trends.
                </p>
              </div>

              {/* Delete Account Button */}
              <div className="mt-6 flex items-center gap-4">
                <Button
                  className="h-12 flex justify-center items-center w-[320px] text-black border border-black bg-white hover:bg-gray-100"
                  onClick={() => deleteAccountHandler(userId, userKey)}
                >
                  <span className="xl:text-lg">Delete Account</span>
                </Button>
                <p className="text-sm text-gray-600 flex-1">
                  This will delete your GitHub Trends account and then redirect
                  you to a GitHub screen where you can revoke your access token.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* User is not logged in - show login options */}
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
                  Generate stats based on your contributions in public
                  repositories.
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
                  Includes contributions from private repositories for more
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
            const radius = 60;
            const centerX = 70;
            const startAngle = Math.PI * 0.75; // 135 degrees
            const endAngle = Math.PI * 1.25; // 225 degrees

            const angle =
              startAngle +
              (endAngle - startAngle) * (index / (cards.length - 1));
            const x = centerX + radius * Math.cos(angle);

            return (
              <div
                key={index}
                style={{
                  left: `${x}%`,
                  position: 'relative',
                  zoom: '0.5',
                  marginBottom: '1%',
                }}
              >
                <Image
                  imageSrc={card.imageSrc + card.demoCustomization}
                  compact={false}
                  extraClasses=""
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

LoginStage.propTypes = {
  setCurrItem: PropTypes.func.isRequired,
};

export default LoginStage;
