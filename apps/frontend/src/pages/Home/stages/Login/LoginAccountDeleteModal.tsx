import { useEffect, useRef, type JSX, type RefObject } from "react";
import { createPortal } from "react-dom";

import { Button } from "../../../../components/Generic/Button";

function useOutsideAlerter(
  ref: RefObject<HTMLElement | null>,
  action: () => void,
) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        action();
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [action, ref]);
}

interface LoginAccountDeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function LoginAccountDeleteModal(
  props: LoginAccountDeleteModalProps,
): JSX.Element {
  const { onConfirm, onClose } = props;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useOutsideAlerter(wrapperRef, onClose);

  return createPortal(
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
            Are you sure you want to delete your account from GitHub Stats
            Extended?
          </p>
          <br />
          <div className="flex flex-wrap">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-[0.25rem]"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-gray-200 hover:bg-gray-300 ml-auto rounded-[0.25rem] text-red-600 border-2"
              onClick={onConfirm}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
