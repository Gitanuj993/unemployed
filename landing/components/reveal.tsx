"use client";

import { useEffect, useRef } from "react";

/**
 * Fades a block up as it comes into view, once.
 *
 * An IntersectionObserver rather than a motion library: this is the only
 * animation on the page besides the wordmark, and it is not worth 40 KB of
 * JavaScript. It is also not worth a scroll listener, which would run on every
 * frame to answer a question the browser can answer for free.
 *
 * The element starts visible in the markup and is hidden by CSS only when the
 * script is running, so a reader without JavaScript gets the whole page rather
 * than a blank one.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.dataset.shown = "true";
      return;
    }

    element.dataset.armed = "true";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.shown = "true";
        observer.disconnect();
      },
      // Fire a little before the block reaches the bottom edge, so the movement
      // has finished by the time it is properly in view.
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    observer.observe(element);

    // Arming hides the block, so anything that stops the observer from firing
    // would hide the page permanently. A browser that throttles observers in a
    // background tab is enough to cause it. After a second and a half, show the
    // content regardless: a missed animation is nothing, missing prose is fatal.
    const failsafe = setTimeout(() => {
      element.dataset.shown = "true";
      observer.disconnect();
    }, 1500);

    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
