import Image from "next/image";

export default function Home() {
  return (
    <main className="flex h-screen">
      {/* Left side image - 3/4 width */}
      <div className="relative w-2/3 h-full overflow-hidden">
        <Image
          src="/images/bg-1.jpg"
          alt="food-bg"
          fill
          className="object-cover"
        />
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-r from-transparent to-[#0d1c24] pointer-events-none z-10" / >
      </div>

      {/* Right side content - 1/4 width */}
      <div className="w-1/3 h-full flex items-center justify-center bg-[#0d1c24]">
        <h1 className="text-xl font-bold">Right Content</h1>
      </div>
    </main>
  );
}
