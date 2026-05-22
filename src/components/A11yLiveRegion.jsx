'use client';

import { useEffect, useRef } from 'react';
import { registerLiveRegions } from '@/lib/announcer';

/** Global aria-live regions for session, cart, and form feedback. */
export default function A11yLiveRegion() {
  const politeRef = useRef(null);
  const assertiveRef = useRef(null);

  useEffect(() => {
    registerLiveRegions({
      polite:    politeRef.current,
      assertive: assertiveRef.current,
    });
  }, []);

  return (
    <>
      <div
        ref={politeRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        ref={assertiveRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}
