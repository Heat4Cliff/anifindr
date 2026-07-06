"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: "fadeUp" | "fadeLeft" | "fadeRight" | "scaleUp" | "fadeIn";
  delay?: number;
  duration?: number;
  style?: CSSProperties;
  className?: string;
}

export default function AnimateOnScroll({
  children,
  animation = "fadeUp",
  delay = 0,
  duration = 0.6,
  style,
  className,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("aos-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animationMap: Record<string, CSSProperties> = {
    fadeUp: { transform: "translateY(30px)", opacity: 0 },
    fadeLeft: { transform: "translateX(-30px)", opacity: 0 },
    fadeRight: { transform: "translateX(30px)", opacity: 0 },
    scaleUp: { transform: "scale(0.92)", opacity: 0 },
    fadeIn: { opacity: 0 },
  };

  return (
    <div
      ref={ref}
      className={`aos-item ${className ?? ""}`}
      style={{
        ...animationMap[animation],
        transition: `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, opacity ${duration}s ease ${delay}s`,
        willChange: "transform, opacity",
        height: "100%",
        ...style,
      }}
    >
      {children}
      <style>{`
        .aos-item.aos-visible {
          transform: none !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
