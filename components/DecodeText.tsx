'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

interface DecodeTextProps {
  text: string;
  className?: string;
  /** ms each letter keeps scrambling before it locks in */
  letterDuration?: number;
  /** ms between each letter starting to resolve (stagger) */
  letterDelay?: number;
  /** ms between random character swaps while scrambling */
  scrambleSpeed?: number;
  /** ms to rest on the resolved text before replaying */
  pause?: number;
}

export default function DecodeText({
  text,
  className,
  letterDuration = 400,
  letterDelay = 50,
  scrambleSpeed = 40,
  pause = 2000,
}: DecodeTextProps) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Words with their start index in the full string, so wrapping stays
  // word-based while each letter animates in its own fixed-width cell.
  const words = useMemo(() => {
    const result: { word: string; start: number }[] = [];
    let index = 0;
    for (const word of text.split(' ')) {
      result.push({ word, start: index });
      index += word.length + 1;
    }
    return result;
  }, [text]);

  useEffect(() => {
    const totalDuration = (text.length - 1) * letterDelay + letterDuration;

    const play = () => {
      const start = performance.now();
      let lastScramble = 0;

      const tick = (now: number) => {
        const elapsed = now - start;

        if (now - lastScramble >= scrambleSpeed) {
          lastScramble = now;
          setDisplay(
            text
              .split('')
              .map((char, i) => {
                if (char === ' ') return char;
                const resolved = elapsed >= i * letterDelay + letterDuration;
                return resolved
                  ? char
                  : ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
              })
              .join('')
          );
        }

        if (elapsed < totalDuration) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(text);
          timeoutRef.current = setTimeout(play, pause);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    play();
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [text, letterDuration, letterDelay, scrambleSpeed, pause]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">
        {words.map(({ word, start }, w) => (
          <span key={w}>
            {w > 0 && ' '}
            <span className="inline-block whitespace-nowrap">
              {word.split('').map((char, i) => (
                <span key={i} className="relative inline-block">
                  {/* invisible final char fixes the cell width */}
                  <span className="invisible">{char}</span>
                  <span className="absolute inset-0 text-center">
                    {display[start + i]}
                  </span>
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
