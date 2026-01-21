import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { createMockReq, createMockRes } from "../../mock-http";
import { default as router } from "../../backend/.vercel/output/functions/api.func/router.js";
import { setShouldMock } from "../../axios-override";
import {
  useIsAuthenticated,
  useUserToken,
} from "../../redux/selectors/userSelectors";
import axios from "axios";

const SvgInline = (props) => {
  const [svg, setSvg] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);
  const userToken = useUserToken();
  const isAuthenticated = useIsAuthenticated();
  const { url, stage } = props;

  // provide shouldMock to non-react code in axios-override.js
  useEffect(() => {
    setShouldMock(stage === 0 || !isAuthenticated);
  }, [isAuthenticated, props.stage]);

  useEffect(() => {
    let isCurrent = true;

    const loadSvg = async () => {
      process.env.PAT_1 = userToken;

      setLoaded(false);

      let body;
      let status;

      if (isAuthenticated && (!userToken || userToken === "placeholderPAT")) {
        // waiting for backend call to private-access
        return;
      }

      if (stage === 4 && !isAuthenticated) {
        let res = await axios.get(url);
        body = res.data;
        status = res.status;
      } else {
        const req = createMockReq({
          method: "GET",
          url: url,
        });
        const res = createMockRes();
        await router(req, res);
        body = res._getBody();
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
    loadSvg();

    return () => {
      isCurrent = false;
    };
  }, [userToken, isAuthenticated, props.url, props.stage]);

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

  if (props.forceLoading || !loaded) {
    if (props.compact) {
      return <Skeleton style={{ paddingBottom: "58%" }} />;
    }
    // maximum dimensions of cards in SelectCard stage
    return <Skeleton className="h-[245px] w-[450px]" />;
  }

  // Render a container div for the shadow DOM
  return <div ref={containerRef} id="svgWrapper" className={props.className} />;
};

SvgInline.propTypes = {
  className: PropTypes.any,
  url: PropTypes.string.isRequired,
  forceLoading: PropTypes.bool,
  compact: PropTypes.bool,
  stage: PropTypes.number.isRequired,
};

SvgInline.defaultProps = {
  className: "",
  forceLoading: false,
  compact: false,
};

export default SvgInline;
