import type { Metadata, Viewport  } from "next";
import {  Fraunces, Nunito  } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header/page";
import Footer from "@/components/layout/footer/page";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Feliz cumpleaños",
  description: "Un regalo hecho con cariño",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ebd8f8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${nunito.variable}`}
    >
       <body className="min-h-dvh font-sans antialiased">
        <Header />
        <main className="pt-16">{children}</main>
         <Footer />
      </body>
    </html>
  );
}
