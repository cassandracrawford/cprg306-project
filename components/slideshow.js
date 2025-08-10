"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function SlideShow({ images }) {
  const list = Array.isArray(images) ? images : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFirst, setShowFirst] = useState(true);

  useEffect(() => {
    if (list.length < 2) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % list.length);
      setShowFirst((prev) => !prev);
    }, 5000); // images will change every 5 seconds
    return () => clearInterval(interval);
  }, [list.length]);

  if (list.length === 0) return null;

  const currentImage = list[currentIndex];
  const previousImage =
    list[(currentIndex - 1 + list.length) % list.length];

  return (
    <div className="relative w-full lg:w-[63%] h-[40vh] lg:h-full overflow-hidden">
      {/* Current Image - First render using priority while others lazy by default */}
      <Image
        src={showFirst ? currentImage : previousImage}
        alt="current image"
        fill
        priority={currentIndex === 0}
        sizes="(min-width:1024px) 63vw, 100vw"
        className={`absolute object-cover transition-opacity duration-1000 ease-in-out ${
          showFirst ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Previous Image - lazy load */}
      <Image
        src={showFirst ? previousImage : currentImage}
        alt="previous image"
        fill
        sizes="(min-width:1024px) 63vw, 100vw"
        className={`absolute object-cover transition-opacity duration-1000 ease-in-out ${
          showFirst ? "opacity-0" : "opacity-100"
        }`}
      />
      {/* Gradient Overlay*/}
      <div
        className="absolute inset-0 
                bg-gradient-to-b lg:bg-gradient-to-r 
                from-black/0 to-[#0d1c24]
                z-10 pointer-events-none"
      />
    </div>
  );
}
