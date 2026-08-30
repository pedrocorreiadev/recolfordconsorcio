"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  Building2,
  Calculator,
  CarFront,
  Check,
  CircleDollarSign,
  Clock3,
  Handshake,
  Home,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SpecialistCard } from "@/components/specialist-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  activeSpecialists,
  DEFAULT_CAMPAIGNS,
  formatBRL,
  goalLabel,
  type Campaign,
  type Goal,
} from "@/lib/consorcio";

const goals: Array<{ value: Goal; label: string; copy: string; icon: typeof CarFront }> = [
  { value: "carro", label: "Automóveis", copy: "Automóveis de qualquer marca, novos ou seminovos.", icon: CarFront },
  { value: "imovel", label: "Imóveis", copy: "Compra, construção ou reforma da sua casa.", icon: Building2 },
  { value: "moto", label: "Motocicletas", copy: "Modelos de diferentes estilos acima de R$ 20 mil.", icon: Bike },
];

const specialists = activeSpecialists();

export function PublicHome() {
  const [goal, setGoal] = useState<Goal>("carro");
  const [credit, setCredit] = useState(150000);
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEFAULT_CAMPAIGNS);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => { if (data?.campaigns?.length) setCampaigns(data.campaigns); })
      .catch(() => undefined);
  }, []);

  const simulationHref = useMemo(() => `/simulacao?goal=${goal}&credit=${credit}`, [credit, goal]);
  const featuredCampaigns = campaigns.filter((campaign) => campaign.active).slice(0, 3);

  return (
    <main className="overflow-hidden bg-[#f7f9fc] text-[#0b1d36]">
      <SiteHeader />

      <section className="relative min-h-[720px] bg-[#071b38] pt-[80px] text-white lg:min-h-[760px]">
        <div className="absolute inset-0 overflow-hidden">
          <Image src="/recol-ford-consorcio-hero.png" alt="Pessoa planejando a aquisição de um veículo por consórcio" fill priority className="object-cover object-[66%_center] opacity-55" sizes="100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#071b38_0%,rgba(7,27,56,.94)_36%,rgba(7,27,56,.56)_66%,rgba(7,27,56,.25)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#071b38_0%,transparent_35%)]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f5c55e]/30 bg-[#f5b942]/10 px-4 py-2 text-xs font-bold tracking-wide text-[#ffd77d] backdrop-blur"><Sparkles className="size-4" /> SEM COMPROMISSO</div>
            <h1 className="text-balance text-5xl font-black leading-[1.02] tracking-[-.04em] sm:text-6xl lg:text-7xl">Planeje seu próximo veículo com a <span className="text-[#f5b942]">Recol Ford Consórcio.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/72 sm:text-xl">Veja uma estimativa inicial sem compromisso e fale com especialistas para montar um planejamento detalhado.</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
              <span className="flex items-center gap-2"><Check className="size-4 text-[#f5b942]" /> Veículos novos ou seminovos</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-[#f5b942]" /> Atendimento por especialistas</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-[#f5b942]" /> Valores estimados</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/15 bg-white/95 p-3 text-[#0b1d36] shadow-[0_30px_80px_rgba(0,0,0,.35)] backdrop-blur-xl">
            <div className="rounded-[22px] border border-[#dce5f0] bg-white p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4"><div><span className="text-xs font-extrabold tracking-[.16em] text-[#bd7d08]">ENTRADA RÁPIDA</span><h2 className="mt-2 text-2xl font-black tracking-tight">Comece sua simulação</h2></div><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eef3f9] text-[#0b2d5c]"><Calculator className="size-5" /></span></div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {goals.map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => setGoal(value)} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-sm font-bold transition ${goal === value ? "border-[#0b2d5c] bg-[#0b2d5c] text-white shadow-lg shadow-[#0b2d5c]/15" : "border-[#dce5f0] bg-[#f7f9fc] text-[#53657b] hover:border-[#f5b942]"}`}>
                    <Icon className={`size-5 ${goal === value ? "text-[#f5b942]" : "text-[#0b2d5c]"}`} />{label}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-end justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-wider text-[#708198]">Crédito desejado</span><strong className="mt-1 block text-3xl font-black tracking-tight text-[#0b2d5c]">{formatBRL(credit)}</strong></div><span className="rounded-full bg-[#fff4d8] px-3 py-1 text-xs font-bold text-[#976000]">{goalLabel(goal)}</span></div>
              <Slider className="mt-5 [&_[data-slot=slider-range]]:bg-[#f5b942] [&_[data-slot=slider-thumb]]:border-[#0b2d5c]" value={[credit]} onValueChange={(value) => setCredit(value[0])} min={20000} max={800000} step={5000} aria-label="Valor do crédito" />
              <div className="mt-3 flex justify-between text-[11px] font-semibold text-[#8997a8]"><span>R$ 20 mil</span><span>R$ 800 mil</span></div>
              <Button asChild className="mt-6 h-12 w-full rounded-xl bg-[#f5b942] text-base font-extrabold text-[#09234a] hover:bg-[#ffd16d]"><Link href={simulationHref}>Fazer simulação sem compromisso <ArrowRight className="size-4" /></Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-5 lg:px-8">
        <div className="grid overflow-hidden rounded-[24px] border border-[#dce5f0] bg-white shadow-[0_18px_45px_rgba(28,53,86,.10)] md:grid-cols-3">
          {[
            [ShieldCheck, "Informação transparente", "Você entende a simulação antes de decidir."],
            [Handshake, "Nossa equipe", "Especialistas acompanham da dúvida ao planejamento."],
            [Clock3, "Sem compromisso", "A simulação inicial não obriga contratação."],
          ].map(([Icon, title, copy], index) => { const FeatureIcon = Icon as typeof ShieldCheck; return <div key={String(title)} className={`flex gap-4 p-6 ${index < 2 ? "border-b md:border-r md:border-b-0" : ""}`}><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eef3f9] text-[#0b2d5c]"><FeatureIcon className="size-5" /></span><div><h3 className="font-extrabold">{String(title)}</h3><p className="mt-1 text-sm leading-6 text-[#69798d]">{String(copy)}</p></div></div>; })}
        </div>
      </section>

      <section className="fine-grid py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center"><span className="text-xs font-extrabold tracking-[.18em] text-[#b57708]">CATEGORIAS</span><h2 className="mt-3 text-4xl font-black tracking-[-.035em] sm:text-5xl">Escolha seu objetivo</h2><p className="mt-4 text-lg leading-8 text-[#6b7b8f]">A plataforma ajuda você a estimar crédito, prazo e parcela para diferentes conquistas.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {goals.map(({ value, label, copy, icon: Icon }, index) => (
              <article key={value} className={`group relative overflow-hidden rounded-[28px] border bg-white p-7 transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(22,47,82,.12)] ${index === 0 ? "border-[#e5b348] ring-4 ring-[#f5b942]/10" : "border-[#dce5f0]"}`}>
                {index === 0 && <span className="absolute right-5 top-5 rounded-full bg-[#fff2cf] px-3 py-1 text-[10px] font-extrabold tracking-wider text-[#9a6500]">MAIS PROCURADO</span>}
                <span className="grid size-14 place-items-center rounded-2xl bg-[#0b2d5c] text-[#f5b942] transition group-hover:rotate-3"><Icon className="size-7" /></span>
                <h3 className="mt-7 text-2xl font-black">{label}</h3><p className="mt-3 min-h-12 leading-7 text-[#69798d]">{copy}</p>
                <Link href={`/simulacao?goal=${value}`} className="mt-7 flex items-center gap-2 font-extrabold text-[#0b2d5c] transition group-hover:gap-3">Simular {label.toLowerCase()} <ArrowRight className="size-4 text-[#c2820b]" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><span className="text-xs font-extrabold tracking-[.18em] text-[#b57708]">CAMPANHAS</span><h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Destaques disponíveis</h2></div><p className="max-w-2xl text-lg leading-8 text-[#6b7b8f]">As campanhas ativas alimentam o simulador e podem ser ajustadas pelo painel administrativo.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {featuredCampaigns.map((campaign) => (
              <article key={campaign.id} className="rounded-[24px] border border-[#dce5f0] bg-[#f8fafc] p-6">
                <span className="rounded-full bg-[#fff4d8] px-3 py-1 text-xs font-bold text-[#976000]">{goalLabel(campaign.segment)}</span>
                <h3 className="mt-5 text-xl font-black">{campaign.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#718095]">{campaign.subtitle || "Campanha ativa para simulação."}</p>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#dce5f0] pt-5 text-sm"><div><span className="block text-xs text-[#8996a6]">Crédito</span><strong>{formatBRL(campaign.credit)}</strong></div><div><span className="block text-xs text-[#8996a6]">Prazo</span><strong>{campaign.term} meses</strong></div></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f9fc] py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><span className="text-xs font-extrabold tracking-[.18em] text-[#b57708]">ESPECIALISTAS</span><h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Atendimento por profissionais da equipe</h2></div><p className="max-w-2xl text-lg leading-8 text-[#6b7b8f]">Os especialistas usam o painel para acompanhar os leads, assumir atendimentos e registrar próximos passos.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {specialists.map((specialist) => <SpecialistCard key={specialist.id} specialist={specialist} compact />)}
          </div>
        </div>
      </section>

      <section className="bg-[#071b38] py-24 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><span className="text-xs font-extrabold tracking-[.18em] text-[#f5c55e]">COMO FUNCIONA</span><h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Do desejo ao planejamento.</h2></div><p className="max-w-2xl text-lg leading-8 text-white/65">Você simula, informa um canal de contato e a equipe acompanha o atendimento pelo painel administrativo.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              ["01", Calculator, "Você simula", "Define objetivo, crédito e prazo."],
              ["02", BadgeCheck, "A estimativa aparece", "A parcela é calculada com as taxas configuradas."],
              ["03", CircleDollarSign, "A equipe acompanha", "O lead entra no painel para atendimento."],
              ["04", Home, "Você planeja", "Um especialista ajuda a detalhar a opção."],
            ].map(([number, Icon, title, copy]) => { const StepIcon = Icon as typeof Calculator; return <article key={String(number)} className="rounded-[24px] border border-white/10 bg-white/[.055] p-6"><div className="flex items-center justify-between"><span className="font-black text-[#f5c55e]">{String(number)}</span><StepIcon className="size-5 text-white/45" /></div><h3 className="mt-10 text-xl font-extrabold">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-white/55">{String(copy)}</p></article>; })}
          </div>
          <Button asChild className="mt-12 h-12 rounded-xl bg-[#f5b942] px-6 font-extrabold text-[#09234a] hover:bg-[#ffd16d]"><Link href={simulationHref}>Fazer simulação sem compromisso <ArrowRight className="size-4" /></Link></Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
