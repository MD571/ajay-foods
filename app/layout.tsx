import type { Metadata } from "next"
import { Playfair_Display, DM_Sans } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Ajay Foods & Beverages | Authentic Telugu Catering",
  description:
    "Ajay Foods brings the warmth of authentic Telugu cuisine to every occasion — weddings, corporate events, charity feeds, and daily stalls in Hyderabad.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-[#FDF6EC] min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
