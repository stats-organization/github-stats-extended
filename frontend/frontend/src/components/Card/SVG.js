/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-danger */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { createMockReq, createMockRes } from '../../mock-http';
import { default as router } from '../../backend/.vercel/output/functions/api.func/router.js';
import axios from 'axios';
import { HOST } from '../../constants';
import { DEMO_STATS_CARD } from './demoData/statsCard';

const SvgInline = (props) => {
  const [svg, setSvg] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);
  const userToken = useSelector((state) => state.user.token);
  const userId = useSelector((state) => state.user.userId);
  const { url } = props;

  useEffect(() => {
    const loadSvg = async () => {
      process.env.PAT_1 = userToken;

      setLoaded(false);

      let body;
      let status;

      switch (url) {
        case `https://${HOST}/api?username=anuraghazra&include_all_commits=true&client=wizard`:
          status = 200;
          body = DEMO_STATS_CARD;
          break;

        default:
          const isAuthenticated = userId && userId.length > 0;
          if (
            isAuthenticated &&
            (!userToken || userToken === 'placeholderPAT')
          ) {
            // waiting for backend call to private-access
            return;
          }

          if (isAuthenticated) {
            const req = createMockReq({
              method: 'GET',
              url: url,
            });
            const res = createMockRes();
            await router(req, res);
            body = res._getBody();
            status = res._getStatusCode();
          } else {
            let res = await axios.get(url);
            body = res.data;
            status = res.status;
          }

          if (status >= 300) {
            console.error('failed to fetch/generate SVG');
            return;
          }
      }

      setSvg(body);
      setLoaded(true);
    };
    loadSvg();
  }, [userToken, userId, props.url]);

  useEffect(() => {
    if (loaded && svg && containerRef.current) {
      // Attach shadow root if not already present
      let shadow = containerRef.current.shadowRoot;
      if (!shadow) {
        shadow = containerRef.current.attachShadow({ mode: 'open' });
      }
      // Clear previous content
      shadow.innerHTML = '';
      // Insert SVG
      const wrapper = document.createElement('div');
      wrapper.innerHTML = svg;
      shadow.appendChild(wrapper);
    }
  }, [loaded, svg]);

  if (props.forceLoading || !loaded) {
    if (props.compact) {
      return <Skeleton style={{ paddingBottom: '58%' }} />;
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
};

SvgInline.defaultProps = {
  className: '',
  forceLoading: false,
  compact: false,
};

export default SvgInline;
