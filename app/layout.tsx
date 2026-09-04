import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recol Ford Consórcio | Protótipo arquivado",
  description:
    "Protótipo front-end de uma proposta de simulação de consórcio que não avançou para operação.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
