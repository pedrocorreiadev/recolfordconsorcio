"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  Building2,
  Calculator,
  CarFront,
  Check,
  CircleDollarSign,
  Handshake,
  Home,
  PauseCircle,
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
  type Goal,
} from "@/lib/consorcio";

const goals: Array<{ value: Goal; label: string; copy: string; icon: typeof CarFront }> = [
  { value: "carro", label: "Automóveis", copy: "Automóveis de qualquer marca, novos ou seminovos.", icon: CarFront },
  { value: "imovel", label: "Imóveis", copy: "Compra, construção ou reforma da casa.", icon: Building2 },
  { value: "moto", label: "Motocicletas", copy: "Modelos de diferentes estilos acima de R$ 20 mil.", icon: Bike },
];

const frontNotes = [
  { icon: ShieldCheck, title: "Ideia clara", copy: "Mostrar uma estimativa antes da conversa comercial." },
  { icon: Handshake, title: "Equipe em destaque", copy: "Dar rosto aos especialistas que atenderiam os contatos." },
  { icon: PauseCircle, title: "Projeto pausado", copy: "O fluxo ficou só no front e não seguiu para operação." },
];

const plannedFlow = [
  { number: "01", icon: Calculator, title: "Simulação", copy: "Objetivo, crédito e prazo ficariam na mesma tela." },
  { number: "02", icon: BadgeCheck, title: "Estimativa", copy: "A parcela apareceria de forma rápida e transparente." },
  { number: "03", icon: CircleDollarSign, title: "Contato", copy: "O lead iria para um painel interno da equipe." },
  { number: "04", icon: Home, title: "Atendimento", copy: "Um especialista seguiria com a conversa fora do site." },
];

const specialists = activeSpecialists();
const featuredCampaigns = DEFAULT_CAMPAIGNS.filter((campaign) => campaign.active).slice(0, 3);

export function PublicHome() {
  const [goal, setGoal] = useState<Goal>("carro");
  const [credit, setCredit] = useState(150000);

  const simulationHref = useMemo(() => `/simulacao?goal=${goal}&credit=${credit}`, [credit, goal]);

  return (
    <main className="overflow-hidden bg-[#f7f9fc] text-[#0b1d36]">
      <SiteHeader />

      <section className="relative min-h-[720px] bg-[#071b38] pt-[80px] text-white lg:min-h-[760px]">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/recol-ford-consorcio-hero.png"
            alt="Pessoa planejando a aquisição de um veículo por consórcio"
            fill
            priority
            className="object-cover object-[66%_center] opacity-55"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#071b38_0%,rgba(7,27,56,.94)_36%,rgba(7,27,56,.56)_66%,rgba(7,27,56,.25)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#071b38_0%,transparent_35%)]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f5c55e]/30 bg-[#f5b942]/10 px-4 py-2 text-xs font-bold tracking-wide text-[#ffd77d] backdrop-blur">
              <Sparkles className="size-4" />
              PROTÓTIPO ARQUIVADO
            </div>
            <h1 className="text-balance text-5xl font-black leading-[1.02] tracking-[-.04em] sm:text-6xl lg:text-7xl">
              Recol Ford Consórcio, uma ideia de simulação online.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/72 sm:text-xl">
              Este front ficou como registro de uma proposta: ajudar clientes a imaginar crédito, prazo e parcela antes de falar com a equipe. A operação do produto não avançou.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
              <span className="flex items-center gap-2"><Check className="size-4 text-[#f5b942]" /> Interface preservada</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-[#f5b942]" /> Dados demonstrativos</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-[#f5b942]" /> Sem backend ativo</span>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/15 bg-white/95 p-5 text-[#0b1d36] shadow-[0_30px_80px_rgba(0,0,0,.35)] backdrop-blur-xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold tracking-[.16em] text-[#bd7d08]">DEMONSTRAÇÃO</span>
                <h2 className="mt-2 text-2xl font-black tracking-tight">Simulação visual</h2>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eef3f9] text-[#0b2d5c]">
                <Calculator className="size-5" />
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {goals.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGoal(value)}
                  className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-sm font-bold transition ${goal === value ? "border-[#0b2d5c] bg-[#0b2d5c] text-white shadow-lg shadow-[#0b2d5c]/15" : "border-[#dce5f0] bg-[#f7f9fc] text-[#53657b] hover:border-[#f5b942]"}`}
                >
                  <Icon className={`size-5 ${goal === value ? "text-[#f5b942]" : "text-[#0b2d5c]"}`} />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#708198]">Crédito desejado</span>
                <strong className="mt-1 block text-3xl font-black tracking-tight text-[#0b2d5c]">{formatBRL(credit)}</strong>
              </div>
              <span className="rounded-full bg-[#fff4d8] px-3 py-1 text-xs font-bold text-[#976000]">{goalLabel(goal)}</span>
            </div>
            <Slider
              className="mt-5 [&_[data-slot=slider-range]]:bg-[#f5b942] [&_[data-slot=slider-thumb]]:border-[#0b2d5c]"
              value={[credit]}
              onValueChange={(value) => setCredit(value[0])}
              min={20000}
              max={800000}
              step={5000}
              aria-label="Valor do crédito"
            />
            <div className="mt-3 flex justify-between text-[11px] font-semibold text-[#8997a8]"><span>R$ 20 mil</span><span>R$ 800 mil</span></div>
            <Button asChild className="mt-6 h-12 w-full rounded-xl bg-[#f5b942] text-base font-extrabold text-[#09234a] hover:bg-[#ffd16d]">
              <Link href={simulationHref}>Ver simulação visual <ArrowRight className="size-4" /></Link>
            </Button>
            <p className="mt-3 text-center text-xs leading-5 text-[#7a8798]">A tela usa valores fixos e não envia nenhum lead.</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-5 lg:px-8">
        <div className="grid overflow-hidden rounded-[24px] border border-[#dce5f0] bg-white shadow-[0_18px_45px_rgba(28,53,86,.10)] md:grid-cols-3">
          {frontNotes.map(({ icon: Icon, title, copy }, index) => (
            <div key={title} className={`flex gap-4 p-6 ${index < 2 ? "border-b md:border-r md:border-b-0" : ""}`}>
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eef3f9] text-[#0b2d5c]">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-extrabold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#69798d]">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="fine-grid py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-extrabold tracking-[.18em] text-[#b57708]">CATEGORIAS</span>
            <h2 className="mt-3 text-4xl font-black tracking-[-.035em] sm:text-5xl">Três caminhos que seriam simulados</h2>
            <p className="mt-4 text-lg leading-8 text-[#6b7b8f]">O protótipo nasceu para testar uma jornada simples para automóveis, imóveis e motocicletas.</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {goals.map(({ value, label, copy, icon: Icon }, index) => (
              <article key={value} className={`group relative overflow-hidden rounded-[28px] border bg-white p-7 transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(22,47,82,.12)] ${index === 0 ? "border-[#e5b348] ring-4 ring-[#f5b942]/10" : "border-[#dce5f0]"}`}>
                {index === 0 && <span className="absolute right-5 top-5 rounded-full bg-[#fff2cf] px-3 py-1 text-[10px] font-extrabold tracking-wider text-[#9a6500]">PRIMEIRO TESTE</span>}
                <span className="grid size-14 place-items-center rounded-2xl bg-[#0b2d5c] text-[#f5b942] transition group-hover:rotate-3"><Icon className="size-7" /></span>
                <h3 className="mt-7 text-2xl font-black">{label}</h3>
                <p className="mt-3 min-h-12 leading-7 text-[#69798d]">{copy}</p>
                <Link href={`/simulacao?goal=${value}`} className="mt-7 flex items-center gap-2 font-extrabold text-[#0b2d5c] transition group-hover:gap-3">Ver cenário <ArrowRight className="size-4 text-[#c2820b]" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <span className="text-xs font-extrabold tracking-[.18em] text-[#b57708]">CENÁRIOS</span>
              <h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Valores de exemplo</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#6b7b8f]">Esses cards ficaram como conteúdo fixo para dar forma à interface. Não são campanhas reais em operação.</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {featuredCampaigns.map((campaign) => (
              <article key={campaign.id} className="rounded-[24px] border border-[#dce5f0] bg-[#f8fafc] p-6">
                <span className="rounded-full bg-[#fff4d8] px-3 py-1 text-xs font-bold text-[#976000]">{goalLabel(campaign.segment)}</span>
                <h3 className="mt-5 text-xl font-black">{campaign.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#718095]">{campaign.subtitle || "Cenário usado apenas na simulação visual."}</p>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#dce5f0] pt-5 text-sm">
                  <div><span className="block text-xs text-[#8996a6]">Crédito</span><strong>{formatBRL(campaign.credit)}</strong></div>
                  <div><span className="block text-xs text-[#8996a6]">Prazo</span><strong>{campaign.term} meses</strong></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f9fc] py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <span className="text-xs font-extrabold tracking-[.18em] text-[#b57708]">ESPECIALISTAS</span>
              <h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Quem apareceria no atendimento</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#6b7b8f]">A proposta também era aproximar o cliente da equipe, mostrando perfis antes do primeiro contato.</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {specialists.map((specialist) => <SpecialistCard key={specialist.id} specialist={specialist} compact />)}
          </div>
        </div>
      </section>

      <section className="bg-[#071b38] py-24 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <span className="text-xs font-extrabold tracking-[.18em] text-[#f5c55e]">FLUXO PREVISTO</span>
              <h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">O caminho que seria testado.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/65">A ideia era simples: simular, deixar um contato e receber uma conversa mais cuidadosa depois. O backend dessa etapa não foi levado adiante.</p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {plannedFlow.map(({ number, icon: Icon, title, copy }) => (
              <article key={number} className="rounded-[24px] border border-white/10 bg-white/[.055] p-6">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#f5c55e]">{number}</span>
                  <Icon className="size-5 text-white/45" />
                </div>
                <h3 className="mt-10 text-xl font-extrabold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{copy}</p>
              </article>
            ))}
          </div>

          <Button asChild className="mt-12 h-12 rounded-xl bg-[#f5b942] px-6 font-extrabold text-[#09234a] hover:bg-[#ffd16d]">
            <Link href={simulationHref}>Abrir simulação visual <ArrowRight className="size-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
