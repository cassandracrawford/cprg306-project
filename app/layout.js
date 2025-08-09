import { Geist, Geist_Mono, Nunito_Sans, Sacramento } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"], 
});

const sacramento = Sacramento({
  variable: "--font-sacramento",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata = {
  title: "Trip | zy",
  description: "A travel app for everyone.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${nunitoSans.className} ${geistSans.variable} ${geistMono.variable} ${sacramento.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
