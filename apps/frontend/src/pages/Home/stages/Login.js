/* eslint-disable react/no-array-index-key */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Button, Image } from '../../../components';
import { classnames } from '../../../utils';
import {
  CLIENT_ID,
  DEMO_GIST,
  DEMO_REPO,
  DEMO_USER,
  DEMO_WAKATIME_USER,
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
  const userId = useUserId(null);
  const userKey = useUserKey();
  const privateAccess = usePrivateAccess();
  const isAuthenticated = useIsAuthenticated();

  const dispatch = useDispatch();
  const [deleteModal, setDeleteModal] = useState(false);

  const logout = () => {
    dispatch(_logout());
  };

  const openDeleteModal = () => {
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteModal(false);
  };

  function useOutsideAlerter(ref, action) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          action();
        }
      }

      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref]);
  }

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, closeDeleteModal);

  const deleteAccountHandler = async () => {
    const success = await deleteAccount(userId, userKey);
    if (success) {
      logout();
      window.location = `https://github.com/settings/connections/applications/${CLIENT_ID}`;
    }
  };

  // Card data
  const cards = [
    {
      demoImageSrc: `/pin?repo=${DEMO_REPO}&disable_animations=true`,
    },
    {
      demoImageSrc: `/top-langs?username=${DEMO_USER}&langs_count=4&disable_animations=true`,
    },
    {
      demoImageSrc: `?username=${DEMO_USER}&include_all_commits=true&disable_animations=true`,
    },
    {
      demoImageSrc: `/wakatime?username=${DEMO_WAKATIME_USER}&langs_count=6&card_width=450&disable_animations=true`,
    },
    {
      demoImageSrc: `/gist?id=${DEMO_GIST}&disable_animations=true`,
    },
  ];

  return (
    <div className="h-full flex flex-wrap">
      <div className={classnames(deleteModal ? 'opacity-25' : '', 'md:flex')}>
        <div className="lg:block lg:w-3/5 lg:p-8">
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
                        Switch to public access if you prefer not to share
                        private contributions.
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

                {/* Delete Account Button */}
                <div className="mt-6 flex items-center gap-4">
                  <Button
                    className="h-12 flex justify-center items-center w-[320px] text-black border border-black bg-white hover:bg-gray-100"
                    onClick={openDeleteModal}
                  >
                    <span className="xl:text-lg text-red-600">
                      Delete Account
                    </span>
                  </Button>
                  <p className="text-sm text-gray-600 flex-1">
                    This will delete your GitHub-Stats-Extended account and then
                    redirect you to a GitHub screen where you can revoke your
                    access token.
                  </p>
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
                    Log out from GitHub-Stats-Extended.
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
                    Include contributions from private repositories for more
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
                    Explore options using sample data. Insert your own username
                    in the last step.
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
                    imageSrc={card.demoImageSrc}
                    compact={false}
                    extraClasses=""
                    stage={0}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {deleteModal && (
        <div>
          <div className="fixed left-0 top-0 w-full h-full">
            <div className="w-full h-full flex justify-center items-center">
              <div
                className="w-96 p-4 bg-white rounded-sm border-2 border-gray-200"
                ref={wrapperRef}
              >
                <p className="mb-1 text-2xl text-gray-700">Delete Account</p>
                <hr />
                <br />
                <p>
                  Are you sure you want to delete your account from GitHub
                  Trends?
                </p>
                <br />
                <div className="flex flex-wrap">
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-[0.25rem]"
                    onClick={() => setDeleteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gray-200 hover:bg-gray-300 ml-auto rounded-[0.25rem] text-red-600 border-2"
                    onClick={deleteAccountHandler}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

LoginStage.propTypes = {
  setCurrItem: PropTypes.func.isRequired,
};

export default LoginStage;
