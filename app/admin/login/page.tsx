import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#071b38] px-5 text-white">
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[.06] p-8 shadow-2xl">
        <span className="grid size-14 place-items-center rounded-2xl bg-[#f5b942] text-[#09234a]"><LockKeyhole className="size-6" /></span>
        <p className="mt-7 text-xs font-extrabold tracking-[.16em] text-[#f5c55e]">LOGIN DESATIVADO</p>
        <h1 className="mt-2 text-3xl font-black">O backoffice não entrou em operação</h1>
        <p className="mt-3 leading-7 text-white/60">
          Esta tela existia para proteger o painel administrativo, mas a proposta foi interrompida antes da integração real com login, banco e captação de leads.
        </p>
        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.05] p-4 text-sm leading-6 text-white/55">
          A parte pública do front continua navegável como registro visual do que estava sendo construído.
        </div>
        <Link href="/" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#f5b942] px-4 py-3 text-sm font-extrabold text-[#09234a] hover:bg-[#ffd16d]">
          <ArrowLeft className="size-4" /> Voltar ao site
        </Link>
      </section>
    </main>
  );
}
