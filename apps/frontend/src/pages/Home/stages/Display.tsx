import type { JSX } from "react";
import { toast } from "react-toastify";
import { saveSvgAsPng } from "save-svg-as-png";

import { CardImage } from "../../../components/Card/CardImage";
import { getCardThemeBackdrop } from "../../../components/Card/themeBackdrop";
import { Button } from "../../../components/Generic/Button";
import { HOST } from "../../../constants";
import type { CardUrlBuilder } from "../../../models/CardUrl";
import { useTheme } from "../../../redux/selectors/themeSelectors";

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
  const { isDark } = useTheme();

  const downloadPNG = () => {
    saveSvgAsPng(
      document.getElementById("svgWrapper")?.shadowRoot?.firstElementChild
        ?.firstElementChild as HTMLElement,
      `${filename}.png`,
      {
        scale: 2,
        encoderOptions: 1,
      },
    );
  };

  const copyMarkdown = () => {
    void navigator.clipboard.writeText(
      `[![GitHub Stats](${card.toApiUrl(HOST)})](${link})`,
    );
    toast.info("Copied to Clipboard!", {
      position: "bottom-right",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
  };

  const copyUrl = () => {
    void navigator.clipboard.writeText(card.toApiUrl(HOST));
    toast.info("Copied to Clipboard!", {
      position: "bottom-right",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
  };

  return (
    <div className="w-full flex flex-wrap">
      <div className="h-auto lg:w-2/5 md:w-1/2">
        <div className="p-10 rounded-sm bg-base-200">
          <div className="flex flex-col items-center">
            {[
              {
                title: "Copy Markdown",
                highlight: true,
                onClick: copyMarkdown,
              },
              {
                title: "Copy URL",
                highlight: false,
                onClick: copyUrl,
              },
              {
                title: "Download PNG",
                highlight: false,
                onClick: downloadPNG,
              },
            ].map((item) => (
              <Button
                key={item.title}
                variant={item.highlight ? "primary" : "soft"}
                className="m-4 w-60 flex justify-center"
                onClick={item.onClick}
              >
                {item.title}
              </Button>
            ))}
          </div>
          {!!guestHint && <div className="pt-10 pl-10 pr-10">{guestHint}</div>}
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
          />
        </div>
      </div>
    </div>
  );
}
