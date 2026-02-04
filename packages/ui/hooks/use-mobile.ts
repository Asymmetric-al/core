"use client";

import * as React from "react";
import { BREAKPOINTS, type Breakpoint, getBreakpoint } from "../lib/responsive";

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < BREAKPOINTS.md);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg);
    };

    const mqlMin = window.matchMedia(`(min-width: ${BREAKPOINTS.md}px)`);
    const mqlMax = window.matchMedia(`(max-width: ${BREAKPOINTS.lg - 1}px)`);

    const onChange = () => checkTablet();
    mqlMin.addEventListener("change", onChange);
    mqlMax.addEventListener("change", onChange);
    checkTablet();

    return () => {
      mqlMin.removeEventListener("change", onChange);
      mqlMax.removeEventListener("change", onChange);
    };
  }, []);

  return !!isTablet;
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`);
    const onChange = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.lg);
    };
    mql.addEventListener("change", onChange);
    setIsDesktop(window.innerWidth >= BREAKPOINTS.lg);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isDesktop;
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint | "xs">("xs");

  React.useEffect(() => {
    const updateBreakpoint = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint | "xs";
  width: number;
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = React.useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: "lg",
    width: typeof window !== "undefined" ? window.innerWidth : BREAKPOINTS.lg,
  });

  React.useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      setState({
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        breakpoint: getBreakpoint(width),
        width,
      });
    };

    updateState();
    window.addEventListener("resize", updateState);
    return () => window.removeEventListener("resize", updateState);
  }, []);

  return state;
}

export const useMobile = useIsMobile;
