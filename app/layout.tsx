import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./providers/AuthProvider";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "RealWorld Conduit",
  description: "Made By Youssef Ashraf",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <Navbar />

          <main className="grow">{children}</main>

          <Footer />

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#fff",
                color: "#18181b",
                borderRadius: "8px",
                padding: "12px 16px",
                fontSize: "16px",
                border: "1px solid #e4e4e7", // neutral border
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
              success: {
                style: {
                  border: "1px solid #22c55e", // green border
                },
              },
              error: {
                style: {
                  border: "1px solid #ef4444", // red border
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
