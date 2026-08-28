"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, BarChart3, Bell, CheckCircle2, CircleDollarSign, ExternalLink,
  LogOut, Megaphone, MessageCircle, Plus, RefreshCw, Save, Target, Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { formatBRL, goalLabel, type Campaign, type Goal, type Lead, whatsappUrl } from "@/lib/consorcio";

const initialCampaign = {
  title: "", subtitle: "", segment: "carro" as Goal, credit: 150000, term: 84,
  adminRate: 16, insuranceRate: 0.08168, reducedPercent: 75,
  featured: false, active: true,
};

export function AdminDashboard({ userName }: { userName: string }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState(initialCampaign);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [campaignResponse, leadResponse] = await Promise.all([fetch("/api/campaigns?all=1"), fetch("/api/leads")]);
      if (!campaignResponse.ok || !leadResponse.ok) throw new Error("Não foi possível carregar o painel");
      const [campaignData, leadData] = await Promise.all([campaignResponse.json(), leadResponse.json()]);
      setCampaigns(campaignData.campaigns ?? []);
      setLeads(leadData.leads ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar dados");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadData]);

  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter((lead) => lead.status === "novo").length,
    proposals: leads.filter((lead) => lead.status === "proposta").length,
    volume: leads.reduce((sum, lead) => sum + lead.credit, 0),
  }), [leads]);

  async function saveCampaign() {
    if (!campaign.title.trim()) return toast.error("Informe um título para a campanha");
    setSaving(true);
    try {
      const response = await fetch("/api/campaigns", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(campaign) });
      if (!response.ok) throw new Error((await response.json()).error ?? "Erro ao publicar campanha");
      toast.success("Campanha publicada no site");
      setCampaign(initialCampaign);
      await loadData();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao publicar"); }
    finally { setSaving(false); }
  }

  async function changeCampaign(item: Campaign, field: "active" | "featured", value: boolean) {
    const next = { active: item.active, featured: item.featured, [field]: value };
    const response = await fetch("/api/campaigns", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: item.id, ...next }) });
    if (!response.ok) return toast.error("Não foi possível atualizar a campanha");
    setCampaigns((current) => current.map((entry) => entry.id === item.id ? { ...entry, ...next } : entry));
    toast.success("Campanha atualizada");
  }

  async function changeLeadStatus(id: number, status: Lead["status"]) {
    const response = await fetch("/api/leads", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!response.ok) return toast.error("Não foi possível atualizar o atendimento");
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, status } : lead));
    toast.success("Etapa do atendimento atualizada");
  }

  return (
    <main className="min-h-screen bg-[#f3f6fa] text-[#0b1d36]">
      <Toaster richColors position="top-right" />
      <header className="border-b border-[#dce5f0] bg-[#071b38] text-white">
        <div className="gold-line h-1" />
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-[#f5b942] font-black text-[#09234a]">PC</span><div><p className="text-xs font-bold tracking-[.15em] text-[#f5c55e]">PAINEL ADMINISTRATIVO</p><h1 className="mt-1 text-xl font-black">Pedrão Consórcios</h1></div></div>
          <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-bold">Olá, {userName}</p><p className="text-xs text-white/50">Controle de campanhas e contatos</p></div><Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Link href="/"><ArrowLeft className="size-4" /> Ver site</Link></Button><form action="/api/admin/logout" method="post"><Button type="submit" variant="ghost" size="icon" className="text-white/65 hover:bg-white/10 hover:text-white" aria-label="Sair do painel"><LogOut className="size-4" /></Button></form></div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><span className="text-xs font-extrabold tracking-[.15em] text-[#b57708]">VISÃO GERAL</span><h2 className="mt-2 text-3xl font-black tracking-tight">Seu funil de oportunidades</h2></div><Button variant="outline" onClick={() => void loadData()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Atualizar</Button></div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Users, "Interessados", stats.total, "Contatos salvos"],
            [Bell, "Novos", stats.new, "Aguardando retorno"],
            [Target, "Em proposta", stats.proposals, "Negociações abertas"],
            [CircleDollarSign, "Crédito simulado", formatBRL(stats.volume), "Volume dos contatos"],
          ].map(([Icon, label, value, copy]) => { const StatIcon = Icon as typeof Users; return <article key={String(label)} className="rounded-[22px] border border-[#dce5f0] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-bold text-[#728196]">{String(label)}</span><span className="grid size-9 place-items-center rounded-xl bg-[#eef3f9] text-[#0b2d5c]"><StatIcon className="size-4" /></span></div><strong className="mt-5 block text-3xl font-black tracking-tight">{String(value)}</strong><p className="mt-1 text-xs text-[#8996a6]">{String(copy)}</p></article>; })}
        </div>

        <Tabs defaultValue="leads" className="mt-8">
          <TabsList className="h-12 rounded-xl border border-[#dce5f0] bg-white p-1">
            <TabsTrigger value="leads" className="rounded-lg px-5"><Users /> Interessados</TabsTrigger>
            <TabsTrigger value="campaigns" className="rounded-lg px-5"><Megaphone /> Campanhas</TabsTrigger>
            <TabsTrigger value="new" className="rounded-lg px-5"><Plus /> Nova campanha</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-5 overflow-hidden rounded-[22px] border border-[#dce5f0] bg-white">
            <div className="flex items-center justify-between border-b p-5"><div><h3 className="font-black">Pessoas que pediram planejamento</h3><p className="mt-1 text-sm text-[#7b899a]">Atualize a etapa conforme avançar no WhatsApp.</p></div><BarChart3 className="size-5 text-[#b57708]" /></div>
            {loading ? <div className="space-y-3 p-5">{[1,2,3].map((item) => <Skeleton key={item} className="h-14 w-full" />)}</div> : leads.length === 0 ? <div className="p-12 text-center"><MessageCircle className="mx-auto size-9 text-[#a9b4c1]" /><h4 className="mt-4 font-black">Nenhum contato ainda</h4><p className="mt-2 text-sm text-[#7c8b9d]">Os novos pedidos feitos pelo simulador aparecerão aqui.</p></div> : (
              <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Objetivo</TableHead><TableHead>Crédito</TableHead><TableHead>Parcela estimada</TableHead><TableHead>Etapa</TableHead><TableHead className="text-right">Contato</TableHead></TableRow></TableHeader><TableBody>{leads.map((lead) => <TableRow key={lead.id}><TableCell><strong className="block">{lead.name}</strong><span className="text-xs text-[#8190a2]">{new Date(lead.createdAt + "Z").toLocaleDateString("pt-BR")}</span></TableCell><TableCell>{goalLabel(lead.goal)}</TableCell><TableCell className="font-semibold">{formatBRL(lead.credit)}</TableCell><TableCell>{formatBRL(lead.estimatedInstallment)}</TableCell><TableCell><Select value={lead.status} onValueChange={(value) => void changeLeadStatus(lead.id, value as Lead["status"])}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="novo">Novo</SelectItem><SelectItem value="contatado">Contatado</SelectItem><SelectItem value="proposta">Em proposta</SelectItem><SelectItem value="fechado">Fechado</SelectItem></SelectContent></Select></TableCell><TableCell className="text-right"><Button asChild size="sm" className="bg-[#19a968] hover:bg-[#138c56]"><a href={whatsappUrl(`Olá, ${lead.name}! Aqui é o Pedro, da Pedrão Consórcios. Vi sua simulação de ${formatBRL(lead.credit)} para ${goalLabel(lead.goal).toLowerCase()}.`)} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a></Button></TableCell></TableRow>)}</TableBody></Table></div>
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="mt-5">
            <div className="grid gap-4 lg:grid-cols-2">
              {loading ? [1,2].map((item) => <Skeleton key={item} className="h-56 rounded-[22px]" />) : campaigns.length === 0 ? <div className="rounded-[22px] border border-dashed bg-white p-12 text-center lg:col-span-2"><Megaphone className="mx-auto size-9 text-[#a9b4c1]" /><h3 className="mt-4 font-black">Crie sua primeira campanha</h3><p className="mt-2 text-sm text-[#7c8b9d]">Os valores padrão continuarão no site até você publicar uma.</p></div> : campaigns.map((item) => <article key={item.id} className="rounded-[22px] border border-[#dce5f0] bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-[#eef3f9] px-3 py-1 text-xs font-bold text-[#0b2d5c]">{goalLabel(item.segment)}</span><h3 className="mt-4 text-xl font-black">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#718095]">{item.subtitle || "Sem descrição"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.active ? "Publicada" : "Oculta"}</span></div><div className="mt-6 grid grid-cols-3 gap-3 border-y py-4 text-sm"><div><span className="block text-xs text-[#8996a6]">Crédito</span><strong className="mt-1 block">{formatBRL(item.credit)}</strong></div><div><span className="block text-xs text-[#8996a6]">Prazo</span><strong className="mt-1 block">{item.term} meses</strong></div><div><span className="block text-xs text-[#8996a6]">Taxa adm.</span><strong className="mt-1 block">{item.adminRate}%</strong></div></div><div className="mt-5 flex flex-wrap items-center justify-between gap-4"><label className="flex items-center gap-3 text-sm font-bold"><Switch checked={item.active} onCheckedChange={(value) => void changeCampaign(item, "active", value)} /> Exibir no site</label><label className="flex items-center gap-3 text-sm font-bold"><Switch checked={item.featured} onCheckedChange={(value) => void changeCampaign(item, "featured", value)} /> Destacar</label></div></article>)}
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-5 rounded-[22px] border border-[#dce5f0] bg-white p-6 sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-4"><div><h3 className="text-2xl font-black">Nova campanha</h3><p className="mt-2 text-sm text-[#748398]">Publique condições que serão usadas automaticamente no simulador.</p></div><span className="grid size-11 place-items-center rounded-2xl bg-[#fff3d3] text-[#a56c00]"><Megaphone className="size-5" /></span></div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold">Título</span><Input value={campaign.title} onChange={(event) => setCampaign({ ...campaign, title: event.target.value })} placeholder="Ex.: Seu carro novo começa aqui" className="h-11" /></label>
              <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold">Descrição curta</span><Input value={campaign.subtitle} onChange={(event) => setCampaign({ ...campaign, subtitle: event.target.value })} placeholder="Explique o principal benefício em uma frase" className="h-11" /></label>
              <label className="space-y-2"><span className="text-sm font-bold">Categoria</span><Select value={campaign.segment} onValueChange={(value) => setCampaign({ ...campaign, segment: value as Goal })}><SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="carro">Carro</SelectItem><SelectItem value="imovel">Imóvel</SelectItem><SelectItem value="moto">Moto</SelectItem></SelectContent></Select></label>
              <Field label="Crédito (R$)" value={campaign.credit} onChange={(value) => setCampaign({ ...campaign, credit: value })} />
              <Field label="Prazo (meses)" value={campaign.term} onChange={(value) => setCampaign({ ...campaign, term: value })} />
              <Field label="Taxa administrativa (%)" value={campaign.adminRate} step="0.01" onChange={(value) => setCampaign({ ...campaign, adminRate: value })} />
              <Field label="Seguro mensal (%)" value={campaign.insuranceRate} step="0.00001" onChange={(value) => setCampaign({ ...campaign, insuranceRate: value })} />
              <Field label="Parcela reduzida (%)" value={campaign.reducedPercent} step="1" onChange={(value) => setCampaign({ ...campaign, reducedPercent: value })} />
            </div>
            <div className="mt-6 flex flex-wrap gap-6 rounded-2xl bg-[#f7f9fc] p-5"><label className="flex items-center gap-3 text-sm font-bold"><Switch checked={campaign.active} onCheckedChange={(value) => setCampaign({ ...campaign, active: value })} /> Publicar agora</label><label className="flex items-center gap-3 text-sm font-bold"><Switch checked={campaign.featured} onCheckedChange={(value) => setCampaign({ ...campaign, featured: value })} /> Destacar no simulador</label></div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><p className="flex items-center gap-2 text-xs text-[#7d8b9d]"><CheckCircle2 className="size-4 text-emerald-600" /> Você poderá ocultar ou destacar a campanha depois.</p><Button onClick={() => void saveCampaign()} disabled={saving} className="h-11 bg-[#0b2d5c] px-6 font-bold"><Save className="size-4" /> {saving ? "Publicando..." : "Publicar campanha"}</Button></div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dce5f0] bg-white p-5 text-sm"><p className="text-[#718095]">As alterações do painel passam a valer no simulador público.</p><Link href="/" className="flex items-center gap-2 font-bold text-[#0b2d5c]">Abrir site <ExternalLink className="size-4" /></Link></div>
      </div>
    </main>
  );
}

function Field({ label, value, step = "1", onChange }: { label: string; value: number; step?: string; onChange: (value: number) => void }) {
  return <label className="space-y-2"><span className="text-sm font-bold">{label}</span><Input type="number" value={value} step={step} onChange={(event) => onChange(Number(event.target.value))} className="h-11" /></label>;
}
