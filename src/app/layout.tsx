import type { Metadata } from "next";
import { Petit_Formal_Script } from 'next/font/google';
import "./globals.css";

const petitFormalScript = Petit_Formal_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-petit-formal-script',
});

export const metadata: Metadata = {
  title: "FORMA - 3D Shape Generator",
  description: "Browser-based 3D shape generator with advanced effects and exports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#1e1e1e]">
      <body
        className={`${petitFormalScript.variable} antialiased bg-white text-black overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
