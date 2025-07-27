import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './providers'

export const metadata: Metadata = {
  title: 'WhatsApp Message Dispatcher Application',
  description: 'WhatsApp Dispatcher Pro v4 - Gerencie suas campanhas de WhatsApp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}