import { useState, useEffect } from "react";

type BreakpointKey = "sm" | "md" | "lg" | "xl" | "2xl" | number;

/**
 * Custom hook for responsive design based on media queries
 * @param query - CSS media query string or predefined breakpoint key
 * @returns boolean indicating if the query matches
 */
export const useMediaQuery = (query: string | BreakpointKey): boolean => {
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    setMounted(true);

    const mediaQuery = window.matchMedia(queryString);

    setMatches(mediaQuery.matches);

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
  }, [queryString]);

  return mounted ? matches : false;
};
