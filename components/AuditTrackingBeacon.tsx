'use client';

import { useEffect, useRef } from 'react';

interface AuditTrackingBeaconProps {
  prospectId: string;
}

export default function AuditTrackingBeacon({ prospectId }: AuditTrackingBeaconProps) {
  const pageOpenedSent = useRef(false);
  const pricingViewedSent = useRef(false);

  useEffect(() => {
    if (!prospectId || pageOpenedSent.current) return;
    pageOpenedSent.current = true;

    // 1. Send PAGE_OPENED telemetry beacon
    try {
      const payload = JSON.stringify({
        event: 'PAGE_OPENED',
        metadata: {
          screen: `${window.innerWidth}x${window.innerHeight}`,
          referrer: document.referrer || 'direct',
        },
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(`/api/audit/${prospectId}/track`, blob);
      } else {
        fetch(`/api/audit/${prospectId}/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Non-blocking, fails silently
    }

    // 2. IntersectionObserver to detect when user scrolls to Pricing/Opportunity section
    const targetSection = document.getElementById('pricing-opportunity-section');
    if (!targetSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !pricingViewedSent.current) {
            pricingViewedSent.current = true;

            try {
              const payload = JSON.stringify({
                event: 'PRICING_VIEWED',
                metadata: {
                  visibleRatio: entry.intersectionRatio,
                  timeOnPageMs: performance.now(),
                },
              });

              if (navigator.sendBeacon) {
                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon(`/api/audit/${prospectId}/track`, blob);
              } else {
                fetch(`/api/audit/${prospectId}/track`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: payload,
                  keepalive: true,
                }).catch(() => {});
              }
            } catch {
              // Non-blocking
            }

            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(targetSection);

    return () => {
      observer.disconnect();
    };
  }, [prospectId]);

  return null;
}
