import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/navbar";
import AuthProvider from "./context/AuthProvider";
import StopMobileScreen from "./context/StopMobileScreen";

export const metadata: Metadata = {
  title: "Bomb Party!",
  description: "A fast-paced word game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-900">
        <StopMobileScreen>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </StopMobileScreen>
      </body>
    </html>
  );
}
