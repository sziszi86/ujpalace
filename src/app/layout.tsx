import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://palace-poker.hu'),
  title: "Palace Poker Szombathely | Professzionális Pókerterem",
  description: "Szombathely legmodernebb pókerterme. Texas Hold'em versenyek, Cash Game asztalok, professzionális környezet. Csatlakozz hozzánk minden nap 18:00-06:00 között!",
  keywords: "póker, poker, szombathely, texas holdem, cash game, tournament, verseny, kártya, szerencsejáték",
  authors: [{ name: "Palace Poker Szombathely" }],
  creator: "Palace Poker Szombathely",
  publisher: "Palace Poker Szombathely",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: "https://palace-poker.hu",
    title: "Palace Poker Szombathely | Professzionális Pókerterem",
    description: "Szombathely legmodernebb pókerterme. Texas Hold'em versenyek, Cash Game asztalok, professzionális környezet.",
    siteName: "Palace Poker Szombathely",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Palace Poker Szombathely",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Palace Poker Szombathely | Professzionális Pókerterem",
    description: "Szombathely legmodernebb pókerterme. Texas Hold'em versenyek, Cash Game asztalok, professzionális környezet.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <body className={inter.className}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Palace Poker Szombathely",
              "description": "Professzionális pókerterem Szombathelyen",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Semmelweis u. 2.",
                "addressLocality": "Szombathely",
                "postalCode": "9700",
                "addressCountry": "HU"
              },
              "telephone": "+36 30 971 5832",
              "email": "palacepoker@hotmail.hu",
              "openingHours": "Mo-Su 18:00-06:00",
              "url": "https://palace-poker.hu",
              "priceRange": "$$",
              "servesCuisine": "Entertainment",
              "acceptsReservations": true
            }),
          }}
        />
      </body>
    </html>
  );
}