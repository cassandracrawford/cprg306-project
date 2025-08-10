"use client";

// Login/Register - Landing Page
// This toggles between login and registration forms

import LoginForm from "@/components/login";
import SlideShow from "@/components/slideshow";
import RegisterForm from "@/components/register";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Typewriter from "typewriter-effect";

// Background images for the slideshow - used in Slideshow component
const images = [
  // Image Source: https://unsplash.com/photos/dish-on-white-ceramic-plate-N_Y88TWmGwA
  "/images/bg-1.jpg",
  // Image Source: https://unsplash.com/photos/a-person-standing-in-the-middle-of-a-cave-s0A8sa9oasY
  "/images/bg-2.jpg",
  // Image Source: https://unsplash.com/photos/a-group-of-people-standing-around-in-a-room-9vDdkxSCAD4
  "/images/bg-3.jpg",
  // Image Source: https://unsplash.com/photos/aerial-photography-of-green-mountain-beside-body-of-water-under-white-sky-prSogOoFmkw
  "/images/bg-4.jpg",
];

export default function LoginPage() {
  // To control which form is displayed on the page
  const [isRegister, setIsRegister] = useState(false);

  return (
    <main className="flex flex-col lg:flex-row h-screen bg-[#0d1c24] overflow-hidden">
      {/* Left: Slideshow component */}
      <SlideShow images={images} /> 

      {/* Right: Login or Register (Auth Form) with the page title and animated subtitle*/}
      <div className="w-full lg:w-[37%] flex-1 lg:h-full flex flex-col bg-[#0d1c24] justify-center font-[var(--font-geist-sans)]">
        {/* Page Title */}
        <div className="w-full flex justify-center">
          <h1 className="text-6xl font-bold text-white lg:text-8xl">Trip|zy</h1>
        </div>

        {/* Typewriter Animation for the subtitle */}
        <div className="text-white text-2xl w-full flex justify-center mt-3 mb-8 lg:mb-15 opacity-40 font-[var(--font-geist-sans)]">
          <Typewriter
            options={{
              strings: [
                "for foodies.",
                "for adventure seekers.",
                "for families.",
                "for solo wanderers.",
                "for everyone.",
              ],
              autoStart: true,
              loop: true,
              delay: 75,
              deleteSpeed: 50,
              pauseFor: 1000,
            }}
          />
        </div>
        
        {/* Switch between login and register */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isRegister ? "register" : "login"}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
          >
            {isRegister ? (
              <RegisterForm onSwitch={() => setIsRegister(false)} />
            ) : (
              <LoginForm onSwitch={() => setIsRegister(true)} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
