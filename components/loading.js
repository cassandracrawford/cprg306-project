"use client";

// Loader Reveal Component: just for animating the "My Itineraries" page after Login
// This animation design is inspired by: https://examples.motion.dev/react/loading-line-reveal

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function LoaderReveal({ children }) {
  const [loading, setLoading] = useState(true);
  const [revealStarted, setRevealStarted] = useState(false); // New state to track when reveal animation begins

  useEffect(() => {
    const lineAndTextAppearTimer = setTimeout(() => {
    }, 1600); 

    const fullRevealTimer = setTimeout(() => {
      setRevealStarted(true);
      setTimeout(() => setLoading(false), 1000); 
    }, 1500); 

    return () => {
      clearTimeout(lineAndTextAppearTimer);
      clearTimeout(fullRevealTimer);
    };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-x-hidden">
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-50 flex items-center justify-center"
            exit={{ opacity: 0, transition: { delay: 0.9, duration: 0.1 } }}
          >
            {/* Left half of the background */}
            <motion.div
              initial={{ x: "0%" }}
              animate={revealStarted ? { x: "-100%" } : { x: "0%" }}
              transition={{ delay: 0, duration: 1, ease: "easeInOut" }} 
              className="absolute left-0 top-0 w-1/2 h-full bg-[#0d1c24] z-40"
            />

            {/* Right half of the background */}
            <motion.div
              initial={{ x: "0%" }}
              animate={revealStarted ? { x: "100%" } : { x: "0%" }}
              transition={{ delay: 0, duration: 1, ease: "easeInOut" }} 
              className="absolute right-0 top-0 w-1/2 h-full bg-[#0d1c24] z-40"
            />

            <motion.div
              initial={{ scaleY: 0 }}
              animate={revealStarted ? { opacity: 0, scaleY: 0 } : { scaleY: 1 }}
              transition={
                revealStarted
                  ? { duration: 0.2, delay: 0 } // Disappear immediately
                  : { duration: 0.8 } // Initial load
              }
              className="absolute w-[6px] h-screen bg-[#FFFFFF] origin-center z-50"
            />

            {/* Left text */}
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={revealStarted ? { x: -100, opacity: 0 } : { opacity: 1, x: 0 }}
              transition={
                revealStarted
                  ? { delay: 0, duration: 0.5 } 
                  : { delay: 0.2, duration: 0.5 } 
              }
              className="absolute left-[38%] text-8xl font-bold text-[#FFFFFF] z-50"
            >
              Trip
            </motion.span>

            {/* Right text */}
            <motion.span
              initial={{ opacity: 0, x: 50 }}
              animate={revealStarted ? { x: 100, opacity: 0 } : { opacity: 1, x: 0 }}
              transition={
                revealStarted
                  ? { delay: 0, duration: 0.5 } 
                  : { delay: 0.2, duration: 0.5 } 
              }
              className="absolute right-[42%] text-8xl font-bold text-[#FFFFFF] z-50"
            >
              zy
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Underlying page content */}
      <div className="relative z-0">{children}</div>
    </div>
  );
}