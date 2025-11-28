import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import { GiHamburgerMenu as HamburgerIcon } from 'react-icons/gi';

import { logout as _logout } from '../../redux/actions/userActions';
import { useIsAuthenticated } from '../../redux/selectors/userSelectors';
import appIcon from '../../assets/appLogo64.png';
import { classnames } from '../../utils';
import { GITHUB_PUBLIC_AUTH_URL } from '../../constants';
import { FaGithub as GithubIcon } from 'react-icons/fa';
import { ProgressBar } from '../../components';

const propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

const defaultProps = {
  onClick: null,
  className: null,
};

const StandardLink = ({ to, children, onClick, className }) => (
  <Link
    to={to}
    className={classnames(
      'px-4 py-1 mr-3 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700',
      className,
    )}
    onClick={onClick}
  >
    {children}
  </Link>
);

StandardLink.propTypes = propTypes;

StandardLink.defaultProps = defaultProps;

const MobileLink = ({ to, children, onClick, className }) => (
  <Link
    to={to}
    className={classnames(
      'block text-sm px-2 my-2 py-2 rounded-sm bg-gray-200 text-gray-700',
      className,
    )}
    onClick={onClick}
  >
    {children}
  </Link>
);

MobileLink.propTypes = propTypes;

MobileLink.defaultProps = defaultProps;

const Header = ({ mode, stage, setStage }) => {
  const [toggle, setToggle] = useState(false);

  const isAuthenticated = useIsAuthenticated();

  const dispatch = useDispatch();
  const logout = () => dispatch(_logout());

  return (
    <>
      <div className="text-gray-100 bg-gray-800 shadow-md body-font z-50">
        <div className="px-5 py-2 flex flex-wrap">
          {/* GitHub Trends Logo */}
          <Link
            to="/"
            className="flex items-center title-font font-medium text-gray-50 mb-0 md:mr-8"
          >
            <img src={appIcon} alt="logo" className="w-6 h-6" />
            {mode === 'trends' && (
              <span className="ml-2 text-xl">GitHub Trends</span>
            )}
          </Link>
          {/* Star on GitHub */}
          <div className="hidden md:flex ml-auto items-center text-base justify-center">
            <a
              href="https://www.github.com/avgupta456/github-trends"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                type="button"
                className="rounded-sm shadow bg-gray-200 hover:bg-gray-300 text-black px-3 py-1 flex items-center"
              >
                Star on
                <GithubIcon className="ml-1.5 w-5 h-5" />
              </button>
            </a>
          </div>
          {/* Hamburger Menu */}
          <div className="md:hidden flex ml-auto items-center">
            <button
              type="button"
              className="outline-none"
              onClick={() => setToggle(!toggle)}
            >
              <HamburgerIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
        {/* Hamburger Dropdown */}
        <div className={classnames('p-5 pt-0', !toggle && 'hidden')}>
          {mode === 'trends' && (
            <>
              <MobileLink to="/user" onClick={() => setToggle(false)}>
                Dashboard
              </MobileLink>
            </>
          )}
          {isAuthenticated ? (
            <>
              {mode === 'trends' && (
                <MobileLink to="/settings" onClick={() => setToggle(false)}>
                  Settings
                </MobileLink>
              )}
              <MobileLink
                to="/"
                onClick={() => {
                  setToggle(false);
                  logout();
                }}
              >
                Sign Out
              </MobileLink>
            </>
          ) : (
            <>
              <a
                className="block text-sm px-2 my-2 py-2 rounded-sm bg-gray-800 text-gray-700"
                href={GITHUB_PUBLIC_AUTH_URL}
              >
                Login
              </a>
              <Link
                to="/signup"
                onClick={() => setToggle(false)}
                className="block text-sm px-2 my-2 py-2 rounded-sm bg-blue-500 text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      <ProgressBar
        items={[
          'Login',
          'Select Card',
          'Modify Parameters',
          'Select Theme',
          'Display Card',
        ]}
        currItem={stage}
        setCurrItem={setStage}
      />
    </>
  );
};

Header.propTypes = {
  mode: PropTypes.string.isRequired,
  stage: PropTypes.number.isRequired,
  setStage: PropTypes.func.isRequired,
};

export default Header;
