import { useRef } from "react";
import type { JSX } from "react";
import { toast } from "react-toastify";
import type { ToastOptions } from "react-toastify";

import { HOST } from "../../../constants";
import { CardImage } from "../../components/Card/CardImage";
import { downloadSvgAsPng } from "../../components/Card/downloadSvgAsPng";
import { getCardThemeBackdrop } from "../../components/Card/themeBackdrop";
import { Button } from "../../components/Generic/Button";
import type { CardUrlBuilder } from "../../models/CardUrl";
import { useIsDarkTheme } from "../../useIsDarkTheme";

const TOAST_OPTIONS: ToastOptions = {
  position: "bottom-right",
  autoClose: 1500,
  hideProgressBar: true,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: false,
};

const BUTTON_CLASS = "m-4 w-60 flex justify-center";

interface DisplayStageProps {
  filename: string;
  link: string;
  theme: string;
  card: CardUrlBuilder;
  guestHint: string | null;
}

export function DisplayStage({
  filename,
  link,
  theme,
  card,
  guestHint,
}: DisplayStageProps): JSX.Element {
  const isDark = useIsDarkTheme();
  const previewRef = useRef<HTMLDivElement>(null);

  const downloadPNG = () => {
    const svg = previewRef.current?.shadowRoot?.querySelector("svg");
    if (!svg) {
      toast.error("The card is not ready yet.", TOAST_OPTIONS);
      return;
    }
    downloadSvgAsPng(svg, `${filename}.png`).catch((error: unknown) => {
      console.error(error);
      toast.error("Could not download the card as a PNG.", TOAST_OPTIONS);
    });
  };

  const copy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.info("Copied to Clipboard!", TOAST_OPTIONS);
      })
      .catch((error: unknown) => {
        console.error(error);
        toast.error("Could not copy to the clipboard.", TOAST_OPTIONS);
      });
  };

  return (
    <div className="w-full flex flex-wrap">
      <div className="h-auto lg:w-2/5 md:w-1/2">
        <div className="p-10 rounded-sm bg-base-200">
          <div className="flex flex-col items-center">
            <Button
              variant="primary"
              className={BUTTON_CLASS}
              onClick={() => {
                copy(`[![GitHub Stats](${card.toApiUrl(HOST)})](${link})`);
              }}
            >
              Copy Markdown
            </Button>
            <Button
              variant="soft"
              className={BUTTON_CLASS}
              onClick={() => {
                copy(card.toApiUrl(HOST));
              }}
            >
              Copy URL
            </Button>
            <Button
              variant="soft"
              className={BUTTON_CLASS}
              onClick={downloadPNG}
            >
              Download PNG
            </Button>
          </div>
          {!!guestHint && (
            <div className="pt-10 pl-10 pr-10 text-center">{guestHint}</div>
          )}
        </div>
      </div>
      <div className="w-full lg:w-3/5 md:w-1/2 object-center pt-5 md:pt-0 pl-0 md:pl-5 lg:pl-0">
        <div
          className="w-full lg:w-3/5 mx-auto flex flex-col justify-center sticky top-32 rounded p-4"
          style={{ background: getCardThemeBackdrop(theme, isDark) }}
        >
          <CardImage
            card={card.disableAnimations()}
            stage={4}
            className="flex justify-center"
            ref={previewRef}
          />
        </div>
      </div>
    </div>
  );
}
