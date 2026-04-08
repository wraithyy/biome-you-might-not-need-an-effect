import { useEffect, useRef, useState } from "react";

// SHOULD FLAG: IntersectionObserver in effect
function LazyImage({ src }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <img ref={ref} src={visible ? src : ""} />;
}

// SHOULD FLAG: ResizeObserver in effect
function ResponsiveComponent() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref}>{size.width}x{size.height}</div>;
}
