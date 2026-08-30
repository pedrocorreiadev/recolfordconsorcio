import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#071b38] px-5 text-white">
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[.06] p-8 shadow-2xl">
        <span className="grid size-14 place-items-center rounded-2xl bg-[#f5b942] text-[#09234a]"><LockKeyhole className="size-6" /></span>
        <p className="mt-7 text-xs font-extrabold tracking-[.16em] text-[#f5c55e]">ÁREA ADMINISTRATIVA</p>
        <h1 className="mt-2 text-3xl font-black">Acesse seu painel</h1>
        <p className="mt-3 leading-7 text-white/60">Entre com sua identificação e senha administrativa configuradas no ambiente local.</p>
        <AdminLoginForm />
        <Link href="/" className="mt-6 block text-center text-sm font-semibold text-white/60 hover:text-white">Voltar ao site</Link>
      </section>
    </main>
  );
}
