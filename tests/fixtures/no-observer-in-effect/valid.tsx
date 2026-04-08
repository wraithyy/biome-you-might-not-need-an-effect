import { useCallback, useEffect, useRef, useState } from "react";

// SHOULD NOT FLAG: ref callback instead of Observer in effect
function LazyImage({ src }) {
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (node) {
      observerRef.current = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      });
      observerRef.current.observe(node);
    }
  }, []);

  return <img ref={ref} src={visible ? src : ""} />;
}

// SHOULD NOT FLAG: no Observer usage in effect
function SimpleEffect({ value }) {
  const [doubled, setDoubled] = useState(0);
  useEffect(() => {
    document.title = `Value: ${value}`;
  }, [value]);
  return <div>{doubled}</div>;
}
