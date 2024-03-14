import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Navbar from "../components/Header";

import "./globals.css";
// import "@/css/index.css";
import "@/css/line-area-chart.css";
import "@/css/scatter-time-chart.css";
// import "@/css/tooltip.css";
// import "@/css/swatches.css";
// import "@/css/export.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
