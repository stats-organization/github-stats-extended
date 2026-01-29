import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { createMockRequest, createMockResponse } from "../../mock-http.js";
// @ts-expect-error will be solved by npm package
import { default as router } from "../../backend/.vercel/output/functions/api.func/router.js";
import { setShouldMock } from "../../axios-override.js";
import {
  useIsAuthenticated,
  useUserToken,
} from "../../redux/selectors/userSelectors.js";

interface SvgInlineProps {
  url: string;
  stage: number;
  compact?: boolean;
  className?: string;
  forceLoading?: boolean;
}

/**
 *
 */
export function SvgInline(props: SvgInlineProps): JSX.Element {
  const {
    url,
    stage,
    className,
    compact = false,
    forceLoading = false,
  } = props;

  const [svg, setSvg] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const userToken = useUserToken();
  const isAuthenticated = useIsAuthenticated();

  // provide shouldMock to non-react code in axios-override.js
  useEffect(() => {
    setShouldMock(stage === 0 || !isAuthenticated);
  }, [isAuthenticated, stage]);

  useEffect(() => {
    let isCurrent = true;

    const loadSvg = async () => {
      window.process.env.PAT_1 = userToken as string;

      setLoaded(false);

      let body: string;
      let status;

      if (isAuthenticated && (!userToken || userToken === "placeholderPAT")) {
        // waiting for backend call to private-access
        return;
      }

      if (stage === 4 && !isAuthenticated) {
        const res = await axios.get<string>(url);
        body = res.data;
        status = res.status;
      } else {
        const req = createMockRequest({
          method: "GET",
          url,
        });
        const res = createMockResponse();
        // will be solved by npm package
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await router(req, res);
        body = res._getBody() as string;
        status = res._getStatusCode();
      }

      if (status >= 300) {
        console.error("failed to fetch/generate SVG");
        return;
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
      return <Skeleton style={{ paddingBottom: "58%" }} />;
    }
    // maximum dimensions of cards in SelectCard stage
    return <Skeleton className="h-[245px] w-[450px]" />;
  }

  // Render a container div for the shadow DOM
  return <div ref={containerRef} id="svgWrapper" className={className} />;
}
