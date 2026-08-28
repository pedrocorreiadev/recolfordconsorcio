import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pedrão Consórcios | Planeje sua próxima conquista",
  description:
    "Simule seu consórcio de automóveis, imóveis ou motocicletas e receba atendimento personalizado pelo WhatsApp.",
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
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
