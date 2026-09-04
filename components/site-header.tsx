"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, ChevronRight, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { label: "Início", href: "/" },
  { label: "Simulação visual", href: "/simulacao" },
  { label: "Equipe", href: "/especialistas" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#071b38]/95 text-white shadow-lg shadow-[#071b38]/10 backdrop-blur-xl">
      <div className="gold-line h-1 w-full" />
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="Recol Ford Consórcio - início">
          <span className="grid size-11 place-items-center rounded-2xl border border-[#f5c55e]/40 bg-[#f5b942] font-black tracking-tight text-[#09234a] shadow-[0_8px_24px_rgba(245,185,66,.22)] transition-transform group-hover:-rotate-3">RF</span>
          <span className="leading-none"><strong className="block text-[17px] font-extrabold tracking-tight">RECOL FORD</strong><span className="text-[10px] font-semibold tracking-[.22em] text-[#f5c55e]">CONSÓRCIO</span></span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Navegação principal">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`rounded-full px-3 py-2 text-sm font-medium transition ${isActive(pathname, item.href) ? "bg-white/10 text-[#ffd77d]" : "text-white/75 hover:text-[#ffd77d]"}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white/60">Protótipo arquivado</span>
          <Button asChild className="rounded-xl bg-[#f5b942] px-5 font-bold text-[#09234a] shadow-none hover:bg-[#ffd16d]">
            <Link href="/simulacao"><Calculator className="size-4" /> Ver simulação</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild><Button variant="ghost" size="icon" className="text-white hover:bg-white/10 md:hidden" aria-label="Abrir menu"><Menu className="size-6" /></Button></SheetTrigger>
          <SheetContent className="border-[#183861] bg-[#071b38] text-white">
            <SheetHeader>
              <SheetTitle className="text-white">Recol Ford Consórcio</SheetTitle>
              <SheetDescription className="text-white/60">Protótipo front-end preservado como registro da proposta.</SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col px-4" aria-label="Navegação móvel">
              {navItems.map((item) => (
                <SheetClose key={item.href} asChild>
                  <Link href={item.href} className={`flex items-center justify-between border-b border-white/10 py-5 font-semibold ${isActive(pathname, item.href) ? "text-[#ffd77d]" : ""}`}>{item.label}<ChevronRight className="size-4 text-[#f5b942]" /></Link>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Link href="/simulacao" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#f5b942] px-4 py-3 font-extrabold text-[#09234a]">
                  <Calculator className="size-4" /> Ver simulação
                </Link>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
