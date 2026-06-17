import React, { useEffect, useRef, useState } from 'react';

/**
 * Lightweight scroll-reveal wrapper built on IntersectionObserver.
 * Pairs with the [data-reveal] CSS utility in index.css and is
 * automatically disabled under prefers-reduced-motion.
 */
const supportsObserver = typeof IntersectionObserver !== 'undefined';

const Reveal = ({ delay = 0, className = '', children, amount = 0.16, ...rest }) => {
  const ref = useRef(null);
  // When IntersectionObserver is unavailable, render visible immediately.
  const [visible, setVisible] = useState(!supportsObserver);

  useEffect(() => {
    const node = ref.current;
    if (!node || !supportsObserver) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: amount, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [amount]);

  return (
    <div
      ref={ref}
      data-reveal=""
      data-reveal-delay={delay || undefined}
      className={`${visible ? 'is-visible' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Reveal;
