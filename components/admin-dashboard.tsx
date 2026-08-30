"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  LogOut,
  Mail,
  Megaphone,
  MessageCircle,
  Plus,
  RefreshCw,
  Save,
  Target,
  Thermometer,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import type { AdminSession } from "@/lib/admin-session";
import {
  formatBRL,
  goalLabel,
  LEAD_STATUSES,
  LEAD_TEMPERATURES,
  SPECIALISTS,
  specialistName,
  statusLabel,
  temperatureLabel,
  type Campaign,
  type Goal,
  type Lead,
  type LeadStatus,
  type LeadTemperature,
  type SpecialistId,
  whatsappUrl,
} from "@/lib/consorcio";

const initialCampaign = {
  title: "",
  subtitle: "",
  segment: "carro" as Goal,
  credit: 150000,
  term: 84,
  adminRate: 16,
  insuranceRate: 0.08168,
  reducedPercent: 75,
  featured: false,
  active: true,
};

type LeadPatch = Partial<Pick<Lead, "status" | "temperature" | "assignedSpecialistId" | "adminNotes">>;
type SpecialistFilter = SpecialistId | "all" | "unassigned";

const temperatureClasses: Record<LeadTemperature, string> = {
  nao_classificado: "border-slate-200 bg-slate-50 text-slate-600",
  quente: "border-red-100 bg-red-50 text-red-700",
  morno: "border-amber-100 bg-amber-50 text-amber-700",
  frio: "border-sky-100 bg-sky-50 text-sky-700",
};

function mailtoUrl(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function AdminDashboard({ currentAdmin }: { currentAdmin: AdminSession }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignDrafts, setCampaignDrafts] = useState<Record<number, Campaign>>({});
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingCampaignId, setDeletingCampaignId] = useState<number | null>(null);
  const [campaign, setCampaign] = useState(initialCampaign);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [temperatureFilter, setTemperatureFilter] = useState<LeadTemperature | "all">("all");
  const [specialistFilter, setSpecialistFilter] = useState<SpecialistFilter>("all");
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [campaignResponse, leadResponse] = await Promise.all([fetch("/api/campaigns?all=1"), fetch("/api/leads")]);
      const [campaignData, leadData] = await Promise.all([campaignResponse.json().catch(() => ({})), leadResponse.json().catch(() => ({}))]);
      if (!campaignResponse.ok) throw new Error(campaignData.error ?? "Não foi possível carregar campanhas");
      if (!leadResponse.ok) throw new Error(leadData.error ?? "Não foi possível carregar leads");
      const nextCampaigns = campaignData.campaigns ?? [];
      const nextLeads = leadData.leads ?? [];
      setCampaigns(nextCampaigns);
      setCampaignDrafts(Object.fromEntries(nextCampaigns.map((item: Campaign) => [item.id, item])));
      setLeads(nextLeads);
      setNoteDrafts(Object.fromEntries(nextLeads.map((lead: Lead) => [lead.id, lead.adminNotes ?? ""])));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar dados";
      setLoadError(message);
      toast.error(message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadData]);

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const statusMatches = statusFilter === "all" || lead.status === statusFilter;
    const temperatureMatches = temperatureFilter === "all" || lead.temperature === temperatureFilter;
    const specialistMatches =
      specialistFilter === "all" ||
      (specialistFilter === "unassigned" ? !lead.assignedSpecialistId : lead.assignedSpecialistId === specialistFilter);
    return statusMatches && temperatureMatches && specialistMatches;
  }), [leads, specialistFilter, statusFilter, temperatureFilter]);

  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter((lead) => lead.status === "novo").length,
    hot: leads.filter((lead) => lead.temperature === "quente").length,
    unassigned: leads.filter((lead) => !lead.assignedSpecialistId).length,
    volume: leads.reduce((sum, lead) => sum + lead.credit, 0),
  }), [leads]);

  async function saveCampaign() {
    if (!campaign.title.trim()) return toast.error("Informe um título para a campanha");
    setSaving(true);
    try {
      const response = await fetch("/api/campaigns", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(campaign) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Erro ao publicar campanha");
      toast.success("Campanha publicada no site");
      setCampaign(initialCampaign);
      await loadData();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao publicar"); }
    finally { setSaving(false); }
  }

  async function patchCampaign(id: number, changes: Partial<Campaign>, successMessage: string) {
    const response = await fetch("/api/campaigns", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...changes }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.campaign) return toast.error(data.error ?? "Não foi possível atualizar a campanha");
    const updated = data.campaign as Campaign;
    setCampaigns((current) => current.map((item) => item.id === id ? updated : item));
    setCampaignDrafts((current) => ({ ...current, [id]: updated }));
    toast.success(successMessage);
  }

  async function deleteCampaign(id: number, title: string) {
    const confirmed = window.confirm(`Excluir a campanha "${title}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    setDeletingCampaignId(id);
    try {
      const response = await fetch(`/api/campaigns?id=${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Não foi possível excluir a campanha");
      setCampaigns((current) => current.filter((item) => item.id !== id));
      setCampaignDrafts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      toast.success("Campanha excluída");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir campanha");
    } finally {
      setDeletingCampaignId(null);
    }
  }

  async function patchLead(id: number, changes: LeadPatch, successMessage: string) {
    const response = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...changes }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.lead) return toast.error(data.error ?? "Não foi possível atualizar o lead");
    const updatedLead = data.lead as Lead;
    setLeads((current) => current.map((lead) => lead.id === id ? updatedLead : lead));
    setNoteDrafts((current) => ({ ...current, [id]: updatedLead.adminNotes ?? "" }));
    toast.success(successMessage);
  }

  function contactMessage(lead: Lead) {
    return [
      `Olá, ${lead.name}!`,
      `Aqui é ${currentAdmin.name}, da equipe Recol Ford Consórcio.`,
      `Vi sua simulação de ${formatBRL(lead.credit)} para ${goalLabel(lead.goal).toLowerCase()}, com parcela estimada de ${formatBRL(lead.estimatedInstallment)}.`,
      "Posso te enviar um planejamento mais detalhado?",
    ].join("\n");
  }

  function contactButton(lead: Lead) {
    const message = contactMessage(lead);
    if (lead.contactType === "email") {
      return <Button asChild size="sm" variant="outline"><a href={mailtoUrl(lead.contactValue, "Sua simulação sem compromisso", message)}><Mail /> E-mail</a></Button>;
    }
    return <Button asChild size="sm" className="bg-[#19a968] hover:bg-[#138c56]"><a href={whatsappUrl(message, lead.contactValue)} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a></Button>;
  }

  return (
    <main className="min-h-screen bg-[#f3f6fa] text-[#0b1d36]">
      <Toaster richColors position="top-right" />
      <header className="border-b border-[#dce5f0] bg-[#071b38] text-white">
        <div className="gold-line h-1" />
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-[#f5b942] font-black text-[#09234a]">RF</span><div><p className="text-xs font-bold tracking-[.15em] text-[#f5c55e]">PAINEL ADMINISTRATIVO</p><h1 className="mt-1 text-xl font-black">Recol Ford Consórcio</h1></div></div>
          <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-bold">Olá, {currentAdmin.name}</p><p className="text-xs text-white/50">Controle de campanhas e leads</p></div><Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Link href="/"><ArrowLeft className="size-4" /> Ver site</Link></Button><form action="/api/admin/logout" method="post"><Button type="submit" variant="ghost" size="icon" className="text-white/65 hover:bg-white/10 hover:text-white" aria-label="Sair do painel"><LogOut className="size-4" /></Button></form></div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><span className="text-xs font-extrabold tracking-[.15em] text-[#b57708]">VISÃO GERAL</span><h2 className="mt-2 text-3xl font-black tracking-tight">Funil compartilhado da equipe</h2></div><Button variant="outline" onClick={() => void loadData()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Atualizar</Button></div>

        {loadError && <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{loadError}</div>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Users, "Leads", stats.total, "Contatos salvos"],
            [Bell, "Novos", stats.new, "Aguardando retorno"],
            [Thermometer, "Quentes", stats.hot, "Classificados manualmente"],
            [CircleDollarSign, "Crédito simulado", formatBRL(stats.volume), "Volume dos contatos"],
          ].map(([Icon, label, value, copy]) => { const StatIcon = Icon as typeof Users; return <article key={String(label)} className="rounded-[22px] border border-[#dce5f0] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-bold text-[#728196]">{String(label)}</span><span className="grid size-9 place-items-center rounded-xl bg-[#eef3f9] text-[#0b2d5c]"><StatIcon className="size-4" /></span></div><strong className="mt-5 block text-3xl font-black tracking-tight">{String(value)}</strong><p className="mt-1 text-xs text-[#8996a6]">{String(copy)}</p></article>; })}
        </div>

        <Tabs defaultValue="leads" className="mt-8">
          <TabsList className="h-12 rounded-xl border border-[#dce5f0] bg-white p-1">
            <TabsTrigger value="leads" className="rounded-lg px-5"><Users /> Leads</TabsTrigger>
            <TabsTrigger value="campaigns" className="rounded-lg px-5"><Megaphone /> Campanhas</TabsTrigger>
            <TabsTrigger value="new" className="rounded-lg px-5"><Plus /> Nova campanha</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-5">
            <div className="rounded-[22px] border border-[#dce5f0] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5"><div><h3 className="font-black">Leads de simulação sem compromisso</h3><p className="mt-1 text-sm text-[#7b899a]">Filtre, assuma, transfira e atualize os atendimentos.</p></div><BarChart3 className="size-5 text-[#b57708]" /></div>
              <div className="grid gap-4 border-b bg-[#f8fafc] p-5 md:grid-cols-3">
                <label className="space-y-2"><span className="text-sm font-bold">Temperatura</span><Select value={temperatureFilter} onValueChange={(value) => setTemperatureFilter(value as LeadTemperature | "all")}><SelectTrigger className="h-11 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{LEAD_TEMPERATURES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></label>
                <label className="space-y-2"><span className="text-sm font-bold">Situação</span><Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | "all")}><SelectTrigger className="h-11 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{LEAD_STATUSES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></label>
                <label className="space-y-2"><span className="text-sm font-bold">Responsável</span><Select value={specialistFilter} onValueChange={(value) => setSpecialistFilter(value as SpecialistFilter)}><SelectTrigger className="h-11 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="unassigned">Não atribuídos</SelectItem>{SPECIALISTS.map((specialist) => <SelectItem key={specialist.id} value={specialist.id}>{specialist.name}</SelectItem>)}</SelectContent></Select></label>
              </div>
              {loading ? <div className="space-y-3 p-5">{[1,2,3].map((item) => <Skeleton key={item} className="h-40 w-full rounded-2xl" />)}</div> : leads.length === 0 ? <div className="p-12 text-center"><MessageCircle className="mx-auto size-9 text-[#a9b4c1]" /><h4 className="mt-4 font-black">Nenhum lead ainda</h4><p className="mt-2 text-sm text-[#7c8b9d]">Os novos pedidos feitos pelo simulador aparecerão aqui.</p></div> : filteredLeads.length === 0 ? <div className="p-12 text-center"><Target className="mx-auto size-9 text-[#a9b4c1]" /><h4 className="mt-4 font-black">Nenhum lead neste filtro</h4><p className="mt-2 text-sm text-[#7c8b9d]">Ajuste os filtros para ampliar a lista.</p></div> : (
                <div className="space-y-4 p-5">
                  {filteredLeads.map((lead) => (
                    <article key={lead.id} className="rounded-[22px] border border-[#dce5f0] bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2"><h4 className="text-xl font-black">{lead.name}</h4><span className={`rounded-full border px-3 py-1 text-xs font-bold ${temperatureClasses[lead.temperature]}`}>{temperatureLabel(lead.temperature)}</span><span className="rounded-full bg-[#eef3f9] px-3 py-1 text-xs font-bold text-[#0b2d5c]">{statusLabel(lead.status)}</span></div>
                          <p className="mt-2 text-sm text-[#718095]">{goalLabel(lead.goal)} • {formatBRL(lead.credit)} • {lead.term} meses • {formatBRL(lead.estimatedInstallment)}</p>
                          <p className="mt-1 text-xs text-[#8a98aa]">Contato: {lead.contactValue} • Criado em {new Date(lead.createdAt).toLocaleString("pt-BR")}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {contactButton(lead)}
                          {!lead.assignedSpecialistId && <Button size="sm" variant="outline" onClick={() => void patchLead(lead.id, { assignedSpecialistId: currentAdmin.id }, "Lead assumido")}><UserCheck /> Assumir</Button>}
                        </div>
                      </div>
                      <div className="mt-5 grid gap-4 lg:grid-cols-4">
                        <label className="space-y-2"><span className="text-xs font-bold uppercase tracking-wide text-[#748398]">Situação</span><Select value={lead.status} onValueChange={(value) => void patchLead(lead.id, { status: value as LeadStatus }, "Situação atualizada")}><SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger><SelectContent>{LEAD_STATUSES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></label>
                        <label className="space-y-2"><span className="text-xs font-bold uppercase tracking-wide text-[#748398]">Temperatura</span><Select value={lead.temperature} onValueChange={(value) => void patchLead(lead.id, { temperature: value as LeadTemperature }, "Temperatura atualizada")}><SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger><SelectContent>{LEAD_TEMPERATURES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></label>
                        <label className="space-y-2"><span className="text-xs font-bold uppercase tracking-wide text-[#748398]">Responsável</span><Select value={lead.assignedSpecialistId ?? "unassigned"} onValueChange={(value) => void patchLead(lead.id, { assignedSpecialistId: value === "unassigned" ? null : value as SpecialistId }, "Responsável atualizado")}><SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unassigned">Não atribuído</SelectItem>{SPECIALISTS.map((specialist) => <SelectItem key={specialist.id} value={specialist.id}>{specialist.name}</SelectItem>)}</SelectContent></Select></label>
                        <div className="rounded-2xl bg-[#f8fafc] p-4 text-sm leading-6"><strong className="block text-xs uppercase tracking-wide text-[#748398]">Dados</strong><span className="block">Tipo: {lead.contactType === "email" ? "E-mail" : "WhatsApp"}</span><span className="block">Preferência: {specialistName(lead.preferredSpecialistId)}</span><span className="block">Responsável: {specialistName(lead.assignedSpecialistId)}</span>{lead.updatedBy && <span className="block">Última ação: {specialistName(lead.updatedBy)}</span>}<span className="block">Atualizado: {new Date(lead.updatedAt).toLocaleString("pt-BR")}</span></div>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                        <label className="space-y-2"><span className="text-xs font-bold uppercase tracking-wide text-[#748398]">Observações administrativas</span><Textarea value={noteDrafts[lead.id] ?? ""} onChange={(event) => setNoteDrafts((current) => ({ ...current, [lead.id]: event.target.value }))} className="min-h-24 resize-y" placeholder="Registre próximos passos, contexto e combinações do atendimento." /></label>
                        <Button variant="outline" onClick={() => void patchLead(lead.id, { adminNotes: noteDrafts[lead.id] ?? "" }, "Observações salvas")}><Save className="size-4" /> Salvar notas</Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-5">
            <div className="grid gap-4 lg:grid-cols-2">
              {loading ? [1,2].map((item) => <Skeleton key={item} className="h-96 rounded-[22px]" />) : campaigns.length === 0 ? <div className="rounded-[22px] border border-dashed bg-white p-12 text-center lg:col-span-2"><Megaphone className="mx-auto size-9 text-[#a9b4c1]" /><h3 className="mt-4 font-black">Crie sua primeira campanha</h3><p className="mt-2 text-sm text-[#7c8b9d]">Os valores padrão continuarão no site até você publicar uma.</p></div> : campaigns.map((item) => {
                const draft = campaignDrafts[item.id] ?? item;
                return (
                  <article key={item.id} className="rounded-[22px] border border-[#dce5f0] bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-[#eef3f9] px-3 py-1 text-xs font-bold text-[#0b2d5c]">{goalLabel(item.segment)}</span><h3 className="mt-4 text-xl font-black">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#718095]">{item.subtitle || "Sem descrição"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.active ? "Publicada" : "Oculta"}</span></div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold">Título</span><Input value={draft.title} onChange={(event) => setCampaignDrafts((current) => ({ ...current, [item.id]: { ...draft, title: event.target.value } }))} className="h-11" /></label>
                      <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold">Descrição curta</span><Input value={draft.subtitle} onChange={(event) => setCampaignDrafts((current) => ({ ...current, [item.id]: { ...draft, subtitle: event.target.value } }))} className="h-11" /></label>
                      <label className="space-y-2"><span className="text-sm font-bold">Categoria</span><Select value={draft.segment} onValueChange={(value) => setCampaignDrafts((current) => ({ ...current, [item.id]: { ...draft, segment: value as Goal } }))}><SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="carro">Automóveis</SelectItem><SelectItem value="imovel">Imóveis</SelectItem><SelectItem value="moto">Motocicletas</SelectItem></SelectContent></Select></label>
                      <CampaignField label="Crédito (R$)" value={draft.credit} onChange={(value) => setCampaignDrafts((current) => ({ ...current, [item.id]: { ...draft, credit: value } }))} />
                      <CampaignField label="Prazo" value={draft.term} onChange={(value) => setCampaignDrafts((current) => ({ ...current, [item.id]: { ...draft, term: value } }))} />
                      <CampaignField label="Taxa adm. (%)" value={draft.adminRate} step="0.01" onChange={(value) => setCampaignDrafts((current) => ({ ...current, [item.id]: { ...draft, adminRate: value } }))} />
                      <CampaignField label="Seguro (%)" value={draft.insuranceRate} step="0.00001" onChange={(value) => setCampaignDrafts((current) => ({ ...current, [item.id]: { ...draft, insuranceRate: value } }))} />
                      <CampaignField label="Parcela reduzida (%)" value={draft.reducedPercent} step="1" onChange={(value) => setCampaignDrafts((current) => ({ ...current, [item.id]: { ...draft, reducedPercent: value } }))} />
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#f8fafc] p-4"><div className="flex flex-wrap gap-4"><label className="flex items-center gap-3 text-sm font-bold"><Switch checked={draft.active} onCheckedChange={(value) => setCampaignDrafts((current) => ({ ...current, [item.id]: { ...draft, active: value } }))} /> Exibir no site</label><label className="flex items-center gap-3 text-sm font-bold"><Switch checked={draft.featured} onCheckedChange={(value) => setCampaignDrafts((current) => ({ ...current, [item.id]: { ...draft, featured: value } }))} /> Destacar</label></div><div className="flex flex-wrap gap-2"><Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" disabled={deletingCampaignId === item.id} onClick={() => void deleteCampaign(item.id, item.title)}><Trash2 className="size-4" /> {deletingCampaignId === item.id ? "Excluindo..." : "Excluir"}</Button><Button onClick={() => void patchCampaign(item.id, draft, "Campanha atualizada")}><Save className="size-4" /> Salvar</Button></div></div>
                  </article>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-5 rounded-[22px] border border-[#dce5f0] bg-white p-6 sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-4"><div><h3 className="text-2xl font-black">Nova campanha</h3><p className="mt-2 text-sm text-[#748398]">Publique condições que serão usadas automaticamente no simulador.</p></div><span className="grid size-11 place-items-center rounded-2xl bg-[#fff3d3] text-[#a56c00]"><Megaphone className="size-5" /></span></div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold">Título</span><Input value={campaign.title} onChange={(event) => setCampaign({ ...campaign, title: event.target.value })} placeholder="Ex.: Seu automóvel novo começa aqui" className="h-11" /></label>
              <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold">Descrição curta</span><Input value={campaign.subtitle} onChange={(event) => setCampaign({ ...campaign, subtitle: event.target.value })} placeholder="Explique o principal benefício em uma frase" className="h-11" /></label>
              <label className="space-y-2"><span className="text-sm font-bold">Categoria</span><Select value={campaign.segment} onValueChange={(value) => setCampaign({ ...campaign, segment: value as Goal })}><SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="carro">Automóveis</SelectItem><SelectItem value="imovel">Imóveis</SelectItem><SelectItem value="moto">Motocicletas</SelectItem></SelectContent></Select></label>
              <CampaignField label="Crédito (R$)" value={campaign.credit} onChange={(value) => setCampaign({ ...campaign, credit: value })} />
              <CampaignField label="Prazo (meses)" value={campaign.term} onChange={(value) => setCampaign({ ...campaign, term: value })} />
              <CampaignField label="Taxa administrativa (%)" value={campaign.adminRate} step="0.01" onChange={(value) => setCampaign({ ...campaign, adminRate: value })} />
              <CampaignField label="Seguro mensal (%)" value={campaign.insuranceRate} step="0.00001" onChange={(value) => setCampaign({ ...campaign, insuranceRate: value })} />
              <CampaignField label="Parcela reduzida (%)" value={campaign.reducedPercent} step="1" onChange={(value) => setCampaign({ ...campaign, reducedPercent: value })} />
            </div>
            <div className="mt-6 flex flex-wrap gap-6 rounded-2xl bg-[#f7f9fc] p-5"><label className="flex items-center gap-3 text-sm font-bold"><Switch checked={campaign.active} onCheckedChange={(value) => setCampaign({ ...campaign, active: value })} /> Publicar agora</label><label className="flex items-center gap-3 text-sm font-bold"><Switch checked={campaign.featured} onCheckedChange={(value) => setCampaign({ ...campaign, featured: value })} /> Destacar no simulador</label></div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><p className="flex items-center gap-2 text-xs text-[#7d8b9d]"><CheckCircle2 className="size-4 text-emerald-600" /> Você poderá editar, ocultar ou destacar a campanha depois.</p><Button onClick={() => void saveCampaign()} disabled={saving} className="h-11 bg-[#0b2d5c] px-6 font-bold"><Save className="size-4" /> {saving ? "Publicando..." : "Publicar campanha"}</Button></div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dce5f0] bg-white p-5 text-sm"><p className="text-[#718095]">As alterações do painel passam a valer no simulador público durante esta sessão local.</p><Link href="/" className="flex items-center gap-2 font-bold text-[#0b2d5c]">Abrir site <ExternalLink className="size-4" /></Link></div>
      </div>
    </main>
  );
}

function CampaignField({ label, value, step = "1", onChange }: { label: string; value: number; step?: string; onChange: (value: number) => void }) {
  return <label className="space-y-2"><span className="text-sm font-bold">{label}</span><Input type="number" value={value} step={step} onChange={(event) => onChange(Number(event.target.value))} className="h-11" /></label>;
}
