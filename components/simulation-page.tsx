"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  CarFront,
  MessageCircle,
} from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SpecialistMiniCard } from "@/components/specialist-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { detectContact } from "@/lib/contact";
import {
  activeSpecialists,
  calculateInstallment,
  DEFAULT_CAMPAIGNS,
  formatBRL,
  type Goal,
  type SpecialistId,
} from "@/lib/consorcio";

const specialists = activeSpecialists();
const validGoals: Goal[] = ["carro", "imovel", "moto"];

type LeadForm = {
  name: string;
  contact: string;
  preferredSpecialistId: SpecialistId | "unassigned";
};

type LeadFormErrors = Partial<Record<keyof LeadForm, string>>;

const initialLeadForm: LeadForm = {
  name: "",
  contact: "",
  preferredSpecialistId: "unassigned",
};

export function SimulationPage() {
  const params = useSearchParams();
  const queryGoal = params.get("goal");
  const queryCredit = Number(params.get("credit"));
  const [goal, setGoal] = useState<Goal>(
    validGoals.includes(queryGoal as Goal) ? queryGoal as Goal : "carro",
  );
  const [credit, setCredit] = useState(
    Number.isFinite(queryCredit) && queryCredit >= 20000 ? Math.min(queryCredit, 800000) : 150000,
  );
  const [term, setTerm] = useState(84);
  const [reduced, setReduced] = useState(true);
  const [leadForm, setLeadForm] = useState<LeadForm>(initialLeadForm);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const activeCampaign =
    DEFAULT_CAMPAIGNS.find((item) => item.segment === goal && item.featured) ??
    DEFAULT_CAMPAIGNS.find((item) => item.segment === goal)!;

  const installment = useMemo(() => calculateInstallment({
    credit,
    term,
    adminRate: activeCampaign.adminRate,
    insuranceRate: activeCampaign.insuranceRate,
    reducedPercent: activeCampaign.reducedPercent,
    reduced,
  }), [activeCampaign, credit, reduced, term]);

  function updateLeadForm<Key extends keyof LeadForm>(field: Key, value: LeadForm[Key]) {
    setLeadForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitted(false);
  }

  function validateLeadForm() {
    const nextErrors: LeadFormErrors = {};
    if (!leadForm.name.trim()) nextErrors.name = "Informe seu nome.";
    const detected = detectContact(leadForm.contact);
    if (!detected.ok) nextErrors.contact = detected.error;
    return nextErrors;
  }

  function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateLeadForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#0b1d36]">
      <SiteHeader />
      <section className="bg-white pt-[116px]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[.75fr_1.25fr] lg:px-8">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-xs font-extrabold tracking-[.18em] text-[#b57708]">PROTÓTIPO SEM BACKEND</span>
            <h1 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Uma simulação visual, sem envio real.</h1>
            <p className="mt-5 text-lg leading-8 text-[#6b7b8f]">
              Esta tela mostra como seria a primeira conversa com o cliente: valor, prazo, estimativa de parcela e preferência de atendimento. Os dados ficam só na interface.
            </p>
            <div className="mt-8 rounded-2xl border border-[#f1d28e] bg-[#fff9eb] p-5 text-sm leading-6 text-[#795917]">
              <strong className="flex items-center gap-2 text-[#5b420e]"><BadgeCheck className="size-4" /> Registro do projeto</strong>
              <p className="mt-2">A proposta não avançou para operação. O cálculo continua aqui apenas para demonstrar a experiência que estava sendo pensada.</p>
            </div>
          </div>

          <form onSubmit={submitLead} className="rounded-[30px] border border-[#dce5f0] bg-[#f8fafc] p-5 shadow-[0_24px_70px_rgba(22,47,82,.08)] sm:p-8">
            <div className="grid gap-7 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-extrabold">O que você quer conquistar?</span>
                <Select value={goal} onValueChange={(value) => setGoal(value as Goal)}>
                  <SelectTrigger className="h-12 w-full rounded-xl bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carro">Automóveis</SelectItem>
                    <SelectItem value="imovel">Imóveis</SelectItem>
                    <SelectItem value="moto">Motocicletas</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-extrabold">Prazo desejado</span>
                <Select value={String(term)} onValueChange={(value) => setTerm(Number(value))}>
                  <SelectTrigger className="h-12 w-full rounded-xl bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>{[60, 72, 84, 100, 120, 180].map((months) => <SelectItem key={months} value={String(months)}>{months} meses</SelectItem>)}</SelectContent>
                </Select>
              </label>
            </div>

            <div className="mt-8 rounded-2xl border border-[#dce5f0] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="text-sm font-bold text-[#687b91]">Crédito desejado</span>
                  <strong className="mt-1 block text-3xl font-black text-[#0b2d5c]">{formatBRL(credit)}</strong>
                </div>
                <span className="text-xs font-semibold text-[#8090a4]">Ajuste o valor abaixo</span>
              </div>
              <Slider
                className="mt-7 [&_[data-slot=slider-range]]:bg-[#f5b942] [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-[#0b2d5c]"
                value={[credit]}
                onValueChange={(value) => setCredit(value[0])}
                min={20000}
                max={800000}
                step={5000}
                aria-label="Valor do crédito"
              />
              <div className="mt-3 flex justify-between text-xs font-semibold text-[#8a98aa]"><span>R$ 20 mil</span><span>R$ 800 mil</span></div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#dce5f0] bg-white p-5">
              <div>
                <strong className="block">Parcela reduzida</strong>
                <span className="mt-1 block text-sm text-[#6e7e92]">Estimativa de {activeCampaign.reducedPercent}% até a contemplação.</span>
              </div>
              <Switch checked={reduced} onCheckedChange={setReduced} className="data-[state=checked]:bg-[#0b2d5c]" aria-label="Ativar parcela reduzida" />
            </div>

            <div className="mt-5 rounded-[24px] bg-[#0b2d5c] p-6 text-white sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-semibold text-white/65">Parcela mensal estimada</span>
                  <strong className="mt-1 block text-4xl font-black tracking-tight text-[#ffd16d]">{formatBRL(installment)}</strong>
                </div>
                <span className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold">{term} parcelas</span>
              </div>
              <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-white/55">Cálculo ilustrativo com taxa administrativa de {activeCampaign.adminRate}% e seguro mensal estimado de {activeCampaign.insuranceRate}%.</p>
              <p className="mt-3 text-xs leading-5 text-white/70">Valores apenas demonstrativos. A versão arquivada não consulta grupos, tabelas comerciais ou banco de dados.</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <FieldError label="Seu nome" error={errors.name}>
                <Input value={leadForm.name} onChange={(event) => updateLeadForm("name", event.target.value)} placeholder="Como podemos te chamar?" className="h-12 rounded-xl bg-white" required />
              </FieldError>
              <FieldError label="WhatsApp ou e-mail" error={errors.contact}>
                <Input value={leadForm.contact} onChange={(event) => updateLeadForm("contact", event.target.value)} placeholder="Digite um contato de exemplo" className="h-12 rounded-xl bg-white" required />
              </FieldError>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-extrabold">Especialista de preferência</span>
                <Select value={leadForm.preferredSpecialistId} onValueChange={(value) => updateLeadForm("preferredSpecialistId", value as SpecialistId | "unassigned")}>
                  <SelectTrigger className="h-12 w-full rounded-xl bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sem preferência</SelectItem>
                    {specialists.map((specialist) => <SelectItem key={specialist.id} value={specialist.id}>{specialist.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </label>
            </div>

            {submitted && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Resumo montado nesta tela. Nenhum dado foi enviado ao backend.</p>}
            <Button type="submit" className="mt-5 h-14 w-full rounded-xl bg-[#19a968] text-base font-extrabold text-white hover:bg-[#138c56]">
              <MessageCircle className="size-5" /> Gerar resumo da simulação
            </Button>
            <p className="mt-3 text-center text-[11px] leading-5 text-[#8492a3]">Nesta versão arquivada, os dados servem apenas para visualizar o fluxo.</p>

            {submitted && (
              <div className="mt-7 border-t border-[#dce5f0] pt-6">
                <h2 className="flex items-center gap-2 text-xl font-black"><CarFront className="size-5 text-[#b57708]" /> Especialistas previstos</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {specialists.map((specialist) => <SpecialistMiniCard key={specialist.id} specialist={specialist} name={leadForm.name} />)}
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function FieldError({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label><span className="mb-2 block text-sm font-extrabold">{label}</span>{children}{error && <span role="alert" className="mt-2 block text-sm font-semibold text-[#b42318]">{error}</span>}</label>;
}
