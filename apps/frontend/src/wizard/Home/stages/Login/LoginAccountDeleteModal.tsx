import { useId } from "react";
import type { JSX } from "react";

import { Button } from "../../../components/Generic/Button";

interface LoginAccountDeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function LoginAccountDeleteModal(
  props: LoginAccountDeleteModalProps,
): JSX.Element {
  const { onConfirm, onClose } = props;

  const titleId = useId();

  return (
    <dialog
      // React re-attaches an inline ref every render, and reopening a dialog throws.
      ref={(node) => {
        if (node !== null && !node.open) {
          node.showModal();
        }
      }}
      className="modal"
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <div className="modal-box w-96">
        <p id={titleId} className="mb-1 text-2xl">
          Delete Account
        </p>
        <hr />
        <br />
        <p>
          Are you sure you want to delete your account from GitHub Stats
          Extended?
        </p>
        <br />
        <div className="flex flex-wrap">
          <Button variant="primary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="error" className="ml-auto" onClick={onConfirm}>
            Delete Account
          </Button>
        </div>
      </div>
      {/* daisyUI's backdrop: submitting it closes the dialog, so a click outside dismisses. */}
      <form method="dialog" className="modal-backdrop">
        <button>Close</button>
      </form>
    </dialog>
  );
}
