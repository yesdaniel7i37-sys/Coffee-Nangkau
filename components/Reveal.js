"use client";
import { useEffect, useRef, useState } from "react";

const anims = { up: "animate-fadeInUp", left: "animate-fadeInLeft", right: "animate-fadeInRight" };

export default function Reveal({ as: Tag = "div", type = "up", delay = 0, className = "", children }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`${show ? anims[type] : "opacity-0"} ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </Tag>
  );
}
