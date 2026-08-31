"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Mail, MessageCircle, PlayCircle, UserRoundCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { initials, whatsappUrl, type Specialist } from "@/lib/consorcio";

function mailtoUrl(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function specialistMessage(specialist: Specialist, name = "") {
  return [
    `Olá, ${specialist.name}.`,
    `Meu nome é ${name || "[seu nome]"} e quero falar sobre uma simulação sem compromisso de consórcio.`,
  ].join("\n");
}

function SpecialistAvatar({ specialist, size = "large" }: { specialist: Specialist; size?: "small" | "large" }) {
  const [failed, setFailed] = useState(false);
  const classes = size === "small" ? "size-12 rounded-xl" : "size-20 rounded-2xl";

  if (specialist.photoPath && !failed) {
    return <Image src={specialist.photoPath} alt={specialist.name} width={96} height={96} onError={() => setFailed(true)} className={`${classes} shrink-0 object-cover`} />;
  }

  return <span className={`${classes} grid shrink-0 place-items-center bg-[#0b2d5c] text-xl font-black text-[#f5b942]`}>{initials(specialist.name)}</span>;
}

export function SpecialistMiniCard({ specialist, name }: { specialist: Specialist; name?: string }) {
  return (
    <article className="rounded-2xl border border-[#dce5f0] bg-white p-4">
      <div className="flex items-center gap-3">
        <SpecialistAvatar specialist={specialist} size="small" />
        <div className="min-w-0"><strong className="block truncate text-sm">{specialist.name}</strong><span className="block truncate text-xs text-[#738299]">{specialist.instagramUser}</span></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline" className="h-9 rounded-lg"><a href={specialist.instagramUrl} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Instagram</a></Button>
        {specialist.whatsapp && <Button asChild size="sm" className="h-9 rounded-lg bg-[#19a968] hover:bg-[#138c56]"><a href={whatsappUrl(specialistMessage(specialist, name), specialist.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> WhatsApp</a></Button>}
      </div>
    </article>
  );
}

export function SpecialistCard({ specialist, name, compact = false }: { specialist: Specialist; name?: string; compact?: boolean }) {
  const message = specialistMessage(specialist, name);

  return (
    <article className="rounded-[24px] border border-[#dce5f0] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <SpecialistAvatar specialist={specialist} />
        <span className="rounded-full bg-[#fff4d8] px-3 py-1 text-xs font-bold text-[#976000]">Ativo</span>
      </div>
      <h3 className="mt-6 text-2xl font-black">{specialist.name}</h3>
      <p className="mt-1 text-sm font-bold text-[#0b2d5c]">{specialist.instagramUser}</p>
      {specialist.description && (
        <p className={`mt-4 leading-7 text-[#69798d] ${compact ? "min-h-20" : ""}`}>{specialist.description}</p>
      )}
      {!compact && specialist.videoPath && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#dce5f0] bg-[#071b38]">
          <video controls preload="metadata" className="aspect-video w-full bg-[#071b38]" src={specialist.videoPath} />
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-xl"><a href={specialist.instagramUrl} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Instagram</a></Button>
        {specialist.whatsapp && <Button asChild className="rounded-xl bg-[#19a968] hover:bg-[#138c56]"><a href={whatsappUrl(message, specialist.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> WhatsApp</a></Button>}
        {specialist.email && <Button asChild variant="outline" className="rounded-xl"><a href={mailtoUrl(specialist.email, "Simulação sem compromisso", message)}><Mail className="size-4" /> E-mail</a></Button>}
        <Button asChild variant="ghost" className="rounded-xl text-[#0b2d5c]"><Link href={`/especialistas/${specialist.slug}`}><PlayCircle className="size-4" /> Perfil</Link></Button>
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-[#eef3f9] pt-4 text-xs font-semibold text-[#748398]"><UserRoundCheck className="size-4 text-[#b57708]" /> Atendimento pela equipe Recol Ford Consórcio</div>
    </article>
  );
}
