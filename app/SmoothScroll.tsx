"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (window.scrollY / h) * 100 : 0;
      if (bar.current) bar.current.style.width = p + "%";
    };
    lenis.on("scroll", onScroll); onScroll();
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
  return (
    <div ref={bar} aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, height: "3px", width: "0%", background: "linear-gradient(90deg,#8b6f35,#e8cf86,#caa24e)", zIndex: 200, boxShadow: "0 0 10px rgba(202,162,78,.7)", transition: "width .1s linear", pointerEvents: "none" }} />
  );
}
