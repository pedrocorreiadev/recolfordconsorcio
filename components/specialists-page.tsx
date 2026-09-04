import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SpecialistCard } from "@/components/specialist-card";
import { activeSpecialists } from "@/lib/consorcio";

export function SpecialistsPage() {
  const specialists = activeSpecialists();

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#0b1d36]">
      <SiteHeader />
      <section className="pt-[116px]">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <span className="text-xs font-extrabold tracking-[.18em] text-[#b57708]">EQUIPE PREVISTA</span>
              <h1 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Os rostos que dariam continuidade ao atendimento.</h1>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#6b7b8f]">
              Esta página mostrava quem atenderia os interessados depois da simulação. Como o projeto parou no protótipo, os contatos e materiais aparecem apenas quando estavam disponíveis no repositório.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {specialists.map((specialist) => <SpecialistCard key={specialist.id} specialist={specialist} />)}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
