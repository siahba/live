import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Job Dailies Tracker",
  description: "Track your daily job activities and export data",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="antialiased">
      <body style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>{children}</body>
    </html>
  )
}
