import { useCallback, useState } from "react";
import type { JSX } from "react";
import { FaGithub as GithubIcon } from "react-icons/fa";
import { useDispatch } from "react-redux";

import { deleteAccount } from "../../../../api/user";
import { Button } from "../../../../components/Generic/Button";
import {
  CLIENT_ID,
  GITHUB_PRIVATE_AUTH_URL,
  HOST,
} from "../../../../constants";
import {
  usePrivateAccess,
  useUserId,
  useUserKey,
} from "../../../../redux/selectors/userSelectors";
import { logout } from "../../../../redux/slices/user";

import { LoginAccountDeleteModal } from "./LoginAccountDeleteModal";
import { LoginBox } from "./LoginBox";

export function LoginAccountManagement(): JSX.Element {
  const userId = useUserId();
  const userKey = useUserKey();
  const privateAccess = usePrivateAccess();

  const dispatch = useDispatch();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleLogout = useCallback(() => {
    dispatch(logout({ userKey: null }));
  }, [dispatch]);

  const handleAccountDelete = async () => {
    const success = await deleteAccount(userId as string, userKey as string);
    if (success) {
      handleLogout();
      window.location.href = `https://github.com/settings/connections/applications/${CLIENT_ID}`;
    }
  };

  return (
    <LoginBox isOpaque={showDeleteModal}>
      <div className="mb-4">
        {privateAccess ? (
          <div className="flex items-center gap-4">
            <a
              href={`https://${HOST}/api/downgrade?user_key=${userKey as string}`}
            >
              <Button
                variant="soft"
                className="h-12 flex justify-center items-center w-[320px]"
              >
                <GithubIcon className="w-6 h-6" />
                <span className="ml-2 xl:text-lg">
                  Downgrade to Public Access
                </span>
              </Button>
            </a>
            <p className="text-sm text-base-content/70 flex-1">
              Switch to public access if you prefer not to share private
              contributions.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <a href={GITHUB_PRIVATE_AUTH_URL}>
              <Button
                variant="primary"
                className="h-12 flex justify-center items-center w-[320px]"
              >
                <GithubIcon className="w-6 h-6" />
                <span className="ml-2 xl:text-lg">
                  Upgrade to Private Access
                </span>
              </Button>
            </a>
            <p className="text-sm text-base-content/70 flex-1">
              Upgrade to include contributions in private repositories for more
              complete and accurate stats.
            </p>
          </div>
        )}
      </div>

      {/* Delete Account Button */}
      <div className="mt-6 flex items-center gap-4">
        <Button
          variant="soft"
          className="h-12 flex justify-center items-center w-[320px]"
          onClick={openDeleteModal}
        >
          <span className="xl:text-lg text-error text-shadow-none">
            Delete Account
          </span>
        </Button>
        <p className="text-sm text-base-content/70 flex-1">
          This will delete your GitHub-Stats-Extended account and then redirect
          you to a GitHub screen where you can revoke your access token.
        </p>
      </div>

      {/* Logout Button */}
      <div className="mt-6 flex items-center gap-4">
        <Button
          variant="soft"
          className="h-12 flex justify-center items-center w-[320px]"
          onClick={handleLogout}
        >
          <span className="xl:text-lg">Log Out</span>
        </Button>
        <p className="text-sm text-base-content/70 flex-1">
          Log out from GitHub-Stats-Extended.
        </p>
      </div>

      {showDeleteModal && (
        <LoginAccountDeleteModal
          onClose={closeDeleteModal}
          onConfirm={() => {
            void handleAccountDelete();
          }}
        />
      )}
    </LoginBox>
  );
}
