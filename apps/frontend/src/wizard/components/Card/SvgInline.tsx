import { loadConfigFromEnv } from "@stats-organization/github-readme-stats-core";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX, Ref, RefCallback } from "react";

import { setShouldMock } from "../../../axios-override.js";
import {
  useIsAuthenticated,
  useUserToken,
} from "../../../redux/selectors/userSelectors.js";
import { renderCard } from "../../renderCard.js";

interface SvgInlineProps {
  url: string;
  stage: number;
  compact?: boolean;
  className?: string;
  forceLoading?: boolean;
  /** Receives the shadow-root host, so a caller can reach the rendered `<svg>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export function SvgInline(props: SvgInlineProps): JSX.Element {
  const {
    url,
    stage,
    className,
    compact = false,
    forceLoading = false,
    ref,
  } = props;

  const [svg, setSvg] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const setContainer = useCallback<RefCallback<HTMLDivElement>>(
    (node) => {
      containerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );
  const userToken = useUserToken();
  const isAuthenticated = useIsAuthenticated();

  // provide shouldMock to non-react code in axios-override.js
  useEffect(() => {
    setShouldMock(stage === 0 || !isAuthenticated);
  }, [isAuthenticated, stage]);

  useEffect(() => {
    let isCurrent = true;

    const loadSvg = async () => {
      const config: Record<string, string | undefined> = {
        FETCH_MULTI_PAGE_STARS: "10",
        PAT_1: userToken as string, // even if it's null, core's retryer.js needs at least one PAT entry to run
      };

      loadConfigFromEnv(config);

      setLoaded(false);

      let body: string;

      if (isAuthenticated && (!userToken || userToken === "placeholderPAT")) {
        // waiting for backend call to private-access
        return;
      }

      if (stage === 4 && !isAuthenticated) {
        const res = await axios.get<string>(url);
        if (res.status >= 300) {
          console.error("failed to fetch SVG");
          return;
        }
        body = res.data;
      } else {
        body = (await renderCard(url)).content;
      }

      if (!isCurrent) {
        return;
      }
      setSvg(body);
      setLoaded(true);
    };
    void loadSvg();

    return () => {
      isCurrent = false;
    };
  }, [userToken, isAuthenticated, url, stage]);

  useEffect(() => {
    if (loaded && svg && containerRef.current) {
      // Attach shadow root if not already present
      let shadow = containerRef.current.shadowRoot;
      if (!shadow) {
        shadow = containerRef.current.attachShadow({ mode: "open" });
      }
      // Clear previous content
      shadow.innerHTML = "";
      // Insert SVG
      const wrapper = document.createElement("div");
      wrapper.innerHTML = svg;
      shadow.appendChild(wrapper);
    }
  }, [loaded, svg]);

  if (forceLoading || !loaded) {
    if (compact) {
      return (
        <div
          key="compact-skeleton"
          className="skeleton w-full"
          style={{ paddingBottom: "58%" }}
        />
      );
    }
    // maximum dimensions of cards in SelectCard stage
    return (
      <div className="w-[450px]">
        <div key="skeleton" className="skeleton h-[245px] w-full" />
      </div>
    );
  }

  // Render a container div for the shadow DOM
  // Using a different key than the skeletons above to ensure react doesn't reuse the node, which would keep its old shadow DOM content visible.
  return (
    <div
      key="svg-wrapper"
      ref={setContainer}
      id="svg-wrapper"
      className={className}
    />
  );
}
