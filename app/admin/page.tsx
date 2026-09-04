import Link from "next/link";
import { ArrowLeft, LayoutDashboard, PauseCircle, UsersRound } from "lucide-react";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#071b38] px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/65 hover:text-white">
          <ArrowLeft className="size-4" /> Voltar ao site
        </Link>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-white/[.06] p-7 shadow-2xl sm:p-10">
          <span className="grid size-14 place-items-center rounded-2xl bg-[#f5b942] text-[#09234a]">
            <PauseCircle className="size-7" />
          </span>
          <p className="mt-7 text-xs font-extrabold tracking-[.16em] text-[#f5c55e]">PAINEL NÃO FINALIZADO</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black tracking-[-.04em] sm:text-5xl">O administrativo ficou apenas como parte da proposta.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
            A ideia era ter um espaço para acompanhar leads, campanhas e responsáveis pelo atendimento. Como o projeto foi descontinuado, esta rota foi mantida só como uma tela de contexto.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/[.055] p-5">
              <LayoutDashboard className="size-6 text-[#f5c55e]" />
              <h2 className="mt-5 text-xl font-extrabold">Funil comercial</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">O painel receberia simulações, status, temperaturas e observações internas.</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/[.055] p-5">
              <UsersRound className="size-6 text-[#f5c55e]" />
              <h2 className="mt-5 text-xl font-extrabold">Distribuição da equipe</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">Cada especialista poderia assumir ou transferir atendimentos conforme a rotina da loja.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
