"use client"

import Image from "next/image";
import { useEffect, useState } from "react";

export default function SlideShow({ images }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showFirst, setShowFirst] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
            setShowFirst((prev) => !prev);
        }, 5000); // images will change every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const currentImage = images[currentIndex];
    const previousImage = images[(currentIndex - 1 + images.length) % images.length];

    return(
        <div className="relative w-full lg:w-[63%] h-[40vh] lg:h-full overflow-hidden">
            {/* Current Image */}
            <Image
                src={showFirst ? currentImage : previousImage}
                alt="current image"
                fill
                className={`absolute object-cover transition-opacity duration-1000 ease-in-out ${
                showFirst ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Previous Image */}
            <Image
                src={showFirst ? previousImage : currentImage}
                alt="previous image"
                fill
                className={`absolute object-cover transition-opacity duration-1000 ease-in-out ${
                showFirst ? 'opacity-0' : 'opacity-100'
                }`}
            />
            {/* Gradient */}
            <div className=" absolute inset-0 
                bg-gradient-to-b lg:bg-gradient-to-r 
                from-black/0 to-[#0d1c24]
                z-10 pointer-events-none 
            "/>
        </div>
    );
}