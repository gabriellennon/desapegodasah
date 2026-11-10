import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

const sans = localFont({
  src: "../public/fonts/dm-sans.ttf",
  variable: "--font-body",
  display: "swap",
})
const editorial = localFont({
  src: "../public/fonts/cormorant.ttf",
  variable: "--font-editorial",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Desapego da Sah | Samara Viau",
  description:
    "Um novo capítulo para peças especiais. Conheça o desapego de roupas e acessórios da Samara Viau.",
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${editorial.variable}`}>
      <body>{children}</body>
    </html>
  )
}
