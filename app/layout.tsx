import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recol Ford Consórcio | Simulação sem compromisso",
  description:
    "Faça uma simulação sem compromisso de consórcio e receba atendimento da equipe de especialistas.",
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
