import { useState, useEffect } from "react";

type BreakpointKey = "sm" | "md" | "lg" | "xl" | "2xl" | number;

/**
 * Custom hook for responsive design based on media queries
 * @param query - CSS media query string or predefined breakpoint key
 * @returns { matches, isLoading } - matches: boolean indicating if the query matches, isLoading: boolean indicating if the hook is still determining the match
 */
export const useMediaQuery = (query: string | BreakpointKey) => {
  const breakpoints = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  };

  const getQueryString = (query: string | BreakpointKey): string => {
    if (typeof query === "number") {
      return `(min-width: ${query}px)`;
    } else if (query in breakpoints) {
      return `(min-width: ${breakpoints[query as keyof typeof breakpoints]})`;
    }
    return query;
  };

  const queryString = getQueryString(query);

  const [matches, setMatches] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(queryString);

    setMatches(mediaQuery.matches);
    setIsLoading(false);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [queryString, isLoading]);

  return { matches, isLoading };
};
