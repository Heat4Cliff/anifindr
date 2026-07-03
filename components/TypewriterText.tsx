"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function TypewriterText({ text, delay = 30, className, style }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    let isDeleting = false;
    let timer: NodeJS.Timeout;

    const type = () => {
      setDisplayedText(text.substring(0, index));
      setIsComplete(false);

      if (!isDeleting && index === text.length) {
        setIsComplete(true);
        isDeleting = true;
        timer = setTimeout(type, 3000); // Jeda 3 detik setelah selesai mengetik
      } else if (isDeleting && index === 0) {
        isDeleting = false;
        timer = setTimeout(type, 500); // Jeda sebelum mengetik ulang
      } else {
        index += isDeleting ? -1 : 1;
        timer = setTimeout(type, isDeleting ? delay / 2 : delay); // Menghapus lebih cepat
      }
    };

    timer = setTimeout(type, delay);

    return () => clearTimeout(timer);
  }, [text, delay]);

  return (
    <p className={className} style={style}>
      {displayedText}
      <span
        style={{
          display: "inline-block",
          width: "2px",
          height: "1em",
          backgroundColor: "currentColor",
          marginLeft: "2px",
          verticalAlign: "middle",
          animation: isComplete ? "blink 1s step-end infinite" : "none",
          opacity: isComplete ? 1 : 1, // Will be controlled by animation when complete
        }}
      />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}} />
    </p>
  );
}
