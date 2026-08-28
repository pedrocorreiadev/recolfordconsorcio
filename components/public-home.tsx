"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BadgeCheck, Bike, Building2, Calculator, CarFront, Check,
  ChevronRight, CircleDollarSign, Clock3, Handshake, Home, Menu,
  MessageCircle, ShieldCheck, Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  calculateInstallment, DEFAULT_CAMPAIGNS, formatBRL, goalLabel,
  type Campaign, type Goal, whatsappUrl,
} from "@/lib/consorcio";

const navItems = [
  ["Início", "#inicio"], ["Simular", "#simular"],
  ["Como funciona", "#como-funciona"], ["Planos", "#planos"],
];

const goals: Array<{ value: Goal; label: string; copy: string; icon: typeof CarFront }> = [
  { value: "carro", label: "Automóveis", copy: "Automóveis de qualquer marca, novos ou seminovos.", icon: CarFront },
  { value: "imovel", label: "Imóveis", copy: "Compra, construção ou reforma da sua casa.", icon: Building2 },
  { value: "moto", label: "Motocicletas", copy: "Modelos de diferentes estilos acima de R$ 20 mil.", icon: Bike },
];

export function PublicHome() {
  const [goal, setGoal] = useState<Goal>("carro");
  const [credit, setCredit] = useState(150000);
  const [term, setTerm] = useState(84);
  const [reduced, setReduced] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEFAULT_CAMPAIGNS);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => { if (data?.campaigns?.length) setCampaigns(data.campaigns); })
      .catch(() => undefined);
  }, []);

  const activeCampaign =
    campaigns.find((item) => item.segment === goal && item.featured) ??
    campaigns.find((item) => item.segment === goal) ??
    DEFAULT_CAMPAIGNS.find((item) => item.segment === goal)!;

  const installment = useMemo(() => calculateInstallment({
    credit, term, adminRate: activeCampaign.adminRate,
    insuranceRate: activeCampaign.insuranceRate,
    reducedPercent: activeCampaign.reducedPercent, reduced,
  }), [activeCampaign, credit, reduced, term]);

  function chooseGoal(nextGoal: Goal, scroll = true) {
    const campaign = campaigns.find((item) => item.segment === nextGoal) ??
      DEFAULT_CAMPAIGNS.find((item) => item.segment === nextGoal)!;
    setGoal(nextGoal);
    setCredit(campaign.credit);
    setTerm(campaign.term);
    if (scroll) document.querySelector("#simular")?.scrollIntoView({ behavior: "smooth" });
  }

  async function contactPedro() {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    if (cleanName && cleanPhone) {
      fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: cleanName, phone: cleanPhone, goal, credit, term, estimatedInstallment: installment, consent: true }),
      }).catch(() => undefined);
    }
    const message = [
      `Olá, Pedro! Meu nome é ${cleanName || "[seu nome]"}.`,
      `Fiz uma simulação para ${goalLabel(goal).toLowerCase()}:`,
      `Crédito: ${formatBRL(credit)}`,
      `Prazo: ${term} meses`,
      `Parcela estimada: ${formatBRL(installment)}${reduced ? " (reduzida)" : ""}`,
      "Gostaria de receber um planejamento personalizado.",
    ].join("\n");
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  }

  return (
    <main className="overflow-hidden bg-[#f7f9fc] text-[#0b1d36]">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#071b38]/95 text-white shadow-lg shadow-[#071b38]/10 backdrop-blur-xl">
        <div className="gold-line h-1 w-full" />
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#inicio" className="group flex items-center gap-3" aria-label="Pedrão Consórcios — início">
            <span className="grid size-11 place-items-center rounded-2xl border border-[#f5c55e]/40 bg-[#f5b942] font-black tracking-tight text-[#09234a] shadow-[0_8px_24px_rgba(245,185,66,.22)] transition-transform group-hover:-rotate-3">PC</span>
            <span className="leading-none"><strong className="block text-[17px] font-extrabold tracking-tight">PEDRÃO</strong><span className="text-[10px] font-semibold tracking-[.22em] text-[#f5c55e]">CONSÓRCIOS</span></span>
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
            {navItems.map(([label, href]) => <a key={href} href={href} className="text-sm font-medium text-white/75 transition hover:text-[#ffd77d]">{label}</a>)}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="ghost" className="text-white/75 hover:bg-white/10 hover:text-white"><Link href="/admin">Área administrativa</Link></Button>
            <Button asChild className="rounded-xl bg-[#f5b942] px-5 font-bold text-[#09234a] shadow-none hover:bg-[#ffd16d]"><a href="#simular">Simular agora</a></Button>
          </div>

          <Sheet>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="text-white hover:bg-white/10 md:hidden" aria-label="Abrir menu"><Menu className="size-6" /></Button></SheetTrigger>
            <SheetContent className="border-[#183861] bg-[#071b38] text-white">
              <SheetHeader><SheetTitle className="text-white">Pedrão Consórcios</SheetTitle><SheetDescription className="text-white/60">Sua conquista começa com um bom plano.</SheetDescription></SheetHeader>
              <nav className="flex flex-col px-4" aria-label="Navegação móvel">
                {navItems.map(([label, href]) => <SheetClose key={href} asChild><a href={href} className="flex items-center justify-between border-b border-white/10 py-5 font-semibold">{label}<ChevronRight className="size-4 text-[#f5b942]" /></a></SheetClose>)}
                <Link href="/admin" className="py-5 text-sm text-white/65">Área administrativa</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <section id="inicio" className="relative min-h-[760px] bg-[#071b38] pt-[80px] text-white lg:min-h-[780px]">
        <div className="absolute inset-0 overflow-hidden">
          <Image src="/pedrao-consorcios-hero.png" alt="Casal planejando a conquista de automóvel, casa e motocicleta" fill priority className="object-cover object-[66%_center] opacity-55" sizes="100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#071b38_0%,rgba(7,27,56,.94)_36%,rgba(7,27,56,.56)_66%,rgba(7,27,56,.25)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#071b38_0%,transparent_35%)]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f5c55e]/30 bg-[#f5b942]/10 px-4 py-2 text-xs font-bold tracking-wide text-[#ffd77d] backdrop-blur"><Sparkles className="size-4" /> PLANEJAMENTO FEITO PARA VOCÊ</div>
            <h1 className="text-balance text-5xl font-black leading-[1.02] tracking-[-.04em] sm:text-6xl lg:text-7xl">O que você quer <span className="text-[#f5b942]">conquistar</span> agora?</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/72 sm:text-xl">Transforme seu próximo automóvel, sua casa ou sua motocicleta em um plano claro, com simulação transparente e atendimento direto.</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
              <span className="flex items-center gap-2"><Check className="size-4 text-[#f5b942]" /> Sem compromisso</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-[#f5b942]" /> Atendimento humano</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-[#f5b942]" /> Planejamento personalizado</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/15 bg-white/95 p-3 text-[#0b1d36] shadow-[0_30px_80px_rgba(0,0,0,.35)] backdrop-blur-xl">
            <div className="rounded-[22px] border border-[#dce5f0] bg-white p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4"><div><span className="text-xs font-extrabold tracking-[.16em] text-[#bd7d08]">SIMULAÇÃO RÁPIDA</span><h2 className="mt-2 text-2xl font-black tracking-tight">Comece pelo seu objetivo</h2></div><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eef3f9] text-[#0b2d5c]"><Calculator className="size-5" /></span></div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {goals.map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => chooseGoal(value, false)} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-sm font-bold transition ${goal === value ? "border-[#0b2d5c] bg-[#0b2d5c] text-white shadow-lg shadow-[#0b2d5c]/15" : "border-[#dce5f0] bg-[#f7f9fc] text-[#53657b] hover:border-[#f5b942]"}`}>
                    <Icon className={`size-5 ${goal === value ? "text-[#f5b942]" : "text-[#0b2d5c]"}`} />{label}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-end justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-wider text-[#708198]">Crédito desejado</span><strong className="mt-1 block text-3xl font-black tracking-tight text-[#0b2d5c]">{formatBRL(credit)}</strong></div><span className="rounded-full bg-[#fff4d8] px-3 py-1 text-xs font-bold text-[#976000]">{term} meses</span></div>
              <Slider className="mt-5 [&_[data-slot=slider-range]]:bg-[#f5b942] [&_[data-slot=slider-thumb]]:border-[#0b2d5c]" value={[credit]} onValueChange={(value) => setCredit(value[0])} min={20000} max={800000} step={5000} aria-label="Valor do crédito" />
              <div className="mt-3 flex justify-between text-[11px] font-semibold text-[#8997a8]"><span>R$ 20 mil</span><span>R$ 800 mil</span></div>
              <Button asChild className="mt-6 h-12 w-full rounded-xl bg-[#f5b942] text-base font-extrabold text-[#09234a] hover:bg-[#ffd16d]"><a href="#simular">Continuar simulação <ArrowRight className="size-4" /></a></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-5 lg:px-8">
        <div className="grid overflow-hidden rounded-[24px] border border-[#dce5f0] bg-white shadow-[0_18px_45px_rgba(28,53,86,.10)] md:grid-cols-3">
          {[
            [ShieldCheck, "Informação transparente", "Você entende a simulação antes de decidir."],
            [Handshake, "Atendimento com o Pedro", "Da dúvida inicial ao acompanhamento da proposta."],
            [Clock3, "Planejamento no seu ritmo", "Escolha crédito e prazo compatíveis com seu momento."],
          ].map(([Icon, title, copy], index) => { const FeatureIcon = Icon as typeof ShieldCheck; return <div key={String(title)} className={`flex gap-4 p-6 ${index < 2 ? "border-b md:border-r md:border-b-0" : ""}`}><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eef3f9] text-[#0b2d5c]"><FeatureIcon className="size-5" /></span><div><h3 className="font-extrabold">{String(title)}</h3><p className="mt-1 text-sm leading-6 text-[#69798d]">{String(copy)}</p></div></div>; })}
        </div>
      </section>

      <section id="planos" className="fine-grid py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center"><span className="text-xs font-extrabold tracking-[.18em] text-[#b57708]">ESCOLHA A SUA CONQUISTA</span><h2 className="mt-3 text-4xl font-black tracking-[-.035em] sm:text-5xl">Um plano para cada objetivo</h2><p className="mt-4 text-lg leading-8 text-[#6b7b8f]">Comece por aquilo que faz sentido para sua vida hoje. A simulação se adapta à sua escolha.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {goals.map(({ value, label, copy, icon: Icon }, index) => (
              <article key={value} className={`group relative overflow-hidden rounded-[28px] border bg-white p-7 transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(22,47,82,.12)] ${index === 0 ? "border-[#e5b348] ring-4 ring-[#f5b942]/10" : "border-[#dce5f0]"}`}>
                {index === 0 && <span className="absolute right-5 top-5 rounded-full bg-[#fff2cf] px-3 py-1 text-[10px] font-extrabold tracking-wider text-[#9a6500]">MAIS PROCURADO</span>}
                <span className="grid size-14 place-items-center rounded-2xl bg-[#0b2d5c] text-[#f5b942] transition group-hover:rotate-3"><Icon className="size-7" /></span>
                <h3 className="mt-7 text-2xl font-black">{label}</h3><p className="mt-3 min-h-12 leading-7 text-[#69798d]">{copy}</p>
                <button type="button" onClick={() => chooseGoal(value)} className="mt-7 flex items-center gap-2 font-extrabold text-[#0b2d5c] transition group-hover:gap-3">Simular {label.toLowerCase()} <ArrowRight className="size-4 text-[#c2820b]" /></button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="simular" className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[.75fr_1.25fr] lg:px-8">
          <div className="lg:sticky lg:top-28 lg:self-start"><span className="text-xs font-extrabold tracking-[.18em] text-[#b57708]">PLANEJAMENTO PERSONALIZADO</span><h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Veja uma estimativa em poucos passos.</h2><p className="mt-5 text-lg leading-8 text-[#6b7b8f]">Escolha o valor, o prazo e a modalidade da parcela. No final, seu pedido chega direto ao WhatsApp do Pedro.</p><div className="mt-8 rounded-2xl border border-[#f1d28e] bg-[#fff9eb] p-5 text-sm leading-6 text-[#795917]"><strong className="flex items-center gap-2 text-[#5b420e]"><BadgeCheck className="size-4" /> Simulação responsável</strong><p className="mt-2">Os valores são estimativas e podem variar conforme o grupo, reajustes e condições vigentes. A contemplação ocorre por sorteio ou lance e não tem data garantida.</p></div></div>

          <div className="rounded-[30px] border border-[#dce5f0] bg-[#f8fafc] p-5 shadow-[0_24px_70px_rgba(22,47,82,.08)] sm:p-8">
            <div className="grid gap-7 sm:grid-cols-2">
              <label className="space-y-2"><span className="text-sm font-extrabold">O que você quer conquistar?</span><Select value={goal} onValueChange={(value) => chooseGoal(value as Goal, false)}><SelectTrigger className="h-12 w-full rounded-xl bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="carro">Automóveis</SelectItem><SelectItem value="imovel">Imóveis</SelectItem><SelectItem value="moto">Motocicletas</SelectItem></SelectContent></Select></label>
              <label className="space-y-2"><span className="text-sm font-extrabold">Prazo desejado</span><Select value={String(term)} onValueChange={(value) => setTerm(Number(value))}><SelectTrigger className="h-12 w-full rounded-xl bg-white"><SelectValue /></SelectTrigger><SelectContent>{[60, 72, 84, 100, 120, 180].map((months) => <SelectItem key={months} value={String(months)}>{months} meses</SelectItem>)}</SelectContent></Select></label>
            </div>
            <div className="mt-8 rounded-2xl border border-[#dce5f0] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><span className="text-sm font-bold text-[#687b91]">Crédito desejado</span><strong className="mt-1 block text-3xl font-black text-[#0b2d5c]">{formatBRL(credit)}</strong></div><span className="text-xs font-semibold text-[#8090a4]">Ajuste o valor abaixo</span></div><Slider className="mt-7 [&_[data-slot=slider-range]]:bg-[#f5b942] [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-[#0b2d5c]" value={[credit]} onValueChange={(value) => setCredit(value[0])} min={20000} max={800000} step={5000} aria-label="Valor do crédito" /><div className="mt-3 flex justify-between text-xs font-semibold text-[#8a98aa]"><span>R$ 20 mil</span><span>R$ 800 mil</span></div></div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#dce5f0] bg-white p-5"><div><strong className="block">Parcela reduzida</strong><span className="mt-1 block text-sm text-[#6e7e92]">Estimativa de {activeCampaign.reducedPercent}% até a contemplação.</span></div><Switch checked={reduced} onCheckedChange={setReduced} className="data-[state=checked]:bg-[#0b2d5c]" aria-label="Ativar parcela reduzida" /></div>
            <div className="mt-5 rounded-[24px] bg-[#0b2d5c] p-6 text-white sm:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><span className="text-sm font-semibold text-white/65">Parcela mensal estimada</span><strong className="mt-1 block text-4xl font-black tracking-tight text-[#ffd16d]">{formatBRL(installment)}</strong></div><span className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold">{term} parcelas</span></div><p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-white/55">Cálculo ilustrativo com taxa administrativa de {activeCampaign.adminRate}% e seguro mensal estimado de {activeCampaign.insuranceRate}%.</p></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-extrabold">Seu nome</span><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Como podemos te chamar?" className="h-12 rounded-xl bg-white" /></label><label><span className="mb-2 block text-sm font-extrabold">Seu WhatsApp</span><Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(68) 99999-9999" inputMode="tel" className="h-12 rounded-xl bg-white" /></label></div>
            <Button onClick={contactPedro} className="mt-5 h-14 w-full rounded-xl bg-[#19a968] text-base font-extrabold text-white hover:bg-[#138c56]"><MessageCircle className="size-5" /> Receber planejamento no WhatsApp</Button>
            <p className="mt-3 text-center text-[11px] leading-5 text-[#8492a3]">Ao continuar, você concorda em enviar esses dados para que Pedro entre em contato sobre esta simulação.</p>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-[#071b38] py-24 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><span className="text-xs font-extrabold tracking-[.18em] text-[#f5c55e]">COMO FUNCIONA</span><h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Do desejo ao planejamento.</h2></div><p className="max-w-2xl text-lg leading-8 text-white/65">O consórcio reúne pessoas com o mesmo objetivo. Todos contribuem mensalmente e as contemplações acontecem por sorteio ou lance, conforme as regras do grupo.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              ["01", Calculator, "Você simula", "Define o bem, o crédito e o prazo desejado."],
              ["02", MessageCircle, "Pedro orienta", "Você recebe as opções e entende as condições."],
              ["03", CircleDollarSign, "Você participa", "Após a adesão, acompanha sorteios e pode ofertar lance."],
              ["04", Home, "Você conquista", "Quando contemplado, usa o crédito conforme as regras do contrato."],
            ].map(([number, Icon, title, copy]) => { const StepIcon = Icon as typeof Calculator; return <article key={String(number)} className="rounded-[24px] border border-white/10 bg-white/[.055] p-6"><div className="flex items-center justify-between"><span className="font-black text-[#f5c55e]">{String(number)}</span><StepIcon className="size-5 text-white/45" /></div><h3 className="mt-10 text-xl font-extrabold">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-white/55">{String(copy)}</p></article>; })}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8"><div className="rounded-[32px] border border-[#dce5f0] bg-[#f7f9fc] p-7 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12"><div className="flex items-start gap-5"><span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#0b2d5c] text-xl font-black text-[#f5b942]">PC</span><div><span className="text-xs font-extrabold tracking-[.15em] text-[#b57708]">ATENDIMENTO DIRETO</span><h2 className="mt-2 text-3xl font-black">Fale com o Pedrão</h2><p className="mt-3 max-w-xl leading-7 text-[#687a90]">Sem ligação fria e sem pressão. Você simula primeiro e conversa comigo quando fizer sentido para o seu momento.</p></div></div><Button asChild className="mt-7 h-12 shrink-0 rounded-xl bg-[#19a968] px-6 font-extrabold text-white hover:bg-[#138c56] lg:mt-0"><a href={whatsappUrl("Olá, Pedro! Conheci o site Pedrão Consórcios e gostaria de tirar uma dúvida.")} target="_blank" rel="noreferrer"><MessageCircle className="size-5" /> Chamar no WhatsApp</a></Button></div></div>
      </section>

      <footer className="border-t border-white/10 bg-[#06162e] py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-end md:justify-between lg:px-8"><div><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#f5b942] font-black text-[#09234a]">PC</span><strong>Pedrão Consórcios</strong></div><p className="mt-4 max-w-lg text-xs leading-6 text-white/45">As simulações são estimativas e não representam proposta comercial definitiva. Consulte as condições do grupo, regulamento e contrato antes da adesão.</p></div><div className="text-sm text-white/50"><p>Pedro Correia • Rio Branco, Acre</p><p className="mt-2">Atendimento: (68) 99916-2099</p></div></div>
      </footer>
    </main>
  );
}
