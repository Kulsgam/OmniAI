import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const outfit = localFont({
  src: "./fonts/Outfit-VariableFont_wght.ttf",
  variable: "--font-outfit",
  weight: "100 900",
});
const parkinsans = localFont({
  src: "./fonts/Parkinsans-VariableFont_wght.ttf",
  variable: "--font-parkinsans",
  weight: "300 800",
});

export const metadata: Metadata = {
  title: "Omni",
  description: "Generate text, images, and videos from a single prompt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${parkinsans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
