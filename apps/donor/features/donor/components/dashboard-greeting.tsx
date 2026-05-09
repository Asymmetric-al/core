"use client";

import { useSyncExternalStore } from "react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function subscribe() {
  return () => {};
}

function getServerSnapshot(): null {
  return null;
}

function getClientSnapshot(): string {
  return getGreeting();
}

export function Greeting() {
  const greeting = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!greeting) return null;
  return <>{greeting}</>;
}
