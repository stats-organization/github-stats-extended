import axios from "axios";
import { useEffect, useMemo, useState } from "react";

import {
  DEMO_GIST,
  DEMO_REPO,
  DEMO_USER,
  DEMO_WAKATIME_USER,
  HOST,
} from "../../constants";
import { CardType } from "../../models/CardType";
import type { CardUrlBuilder } from "../../models/CardUrl";

/** Per-card metadata for the final display stage. */
export interface CardDescriptor {
  /** Sample identity shown to guests (e.g. a sample username or repo). */
  guestHint: string;
  /** URL the card image links to when clicked. */
  link: string;
}

interface UseCardDescriptorOptions {
  selectedCard: CardType;
  /** Themed builder used to derive the stats/top-langs card link. */
  themeBuilder: CardUrlBuilder;
  repo: string;
  userId: string;
  wakatimeUser: string;
  gist: string;
}

/**
 * Resolve the per-card metadata (guest hint + link) for the display stage,
 * fetching the Gist's public URL as a side effect when needed.
 */
export function useCardDescriptor({
  selectedCard,
  themeBuilder,
  repo,
  userId,
  wakatimeUser,
  gist,
}: UseCardDescriptorOptions): CardDescriptor {
  const [gistUrl, setGistUrl] = useState("");

  useEffect(() => {
    async function fetchGistURL() {
      try {
        const result = await axios.get<{ html_url: string }>(
          `https://api.github.com/gists/${gist}`,
        );
        setGistUrl(result.data.html_url);
      } catch (error) {
        console.error(error);
      }
    }
    void fetchGistURL();
  }, [gist]);

  return useMemo<CardDescriptor>(() => {
    const pinRepo = repo.includes("/") ? repo : `${userId}/${repo}`;
    const statsCardLink = themeBuilder.toApiUrl(HOST);

    const descriptors: Record<CardType, CardDescriptor> = {
      [CardType.STATS]: {
        guestHint: `username "${DEMO_USER}"`,
        link: statsCardLink,
      },
      [CardType.TOP_LANGS]: {
        guestHint: `username "${DEMO_USER}"`,
        link: statsCardLink,
      },
      [CardType.PIN]: {
        guestHint: `repo "${DEMO_REPO}"`,
        link: `https://github.com/${pinRepo}`,
      },
      [CardType.GIST]: {
        guestHint: `Gist ID "${DEMO_GIST}"`,
        link: gistUrl,
      },
      [CardType.WAKATIME]: {
        guestHint: `WakaTime username "${DEMO_WAKATIME_USER}"`,
        link: `https://wakatime.com/@${wakatimeUser}`,
      },
    };

    return descriptors[selectedCard];
  }, [selectedCard, themeBuilder, repo, userId, gistUrl, wakatimeUser]);
}
