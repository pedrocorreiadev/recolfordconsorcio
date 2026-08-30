export type Goal = "carro" | "imovel" | "moto";

export type SpecialistId = "flavio" | "jessica" | "jersey";
export type ContactType = "whatsapp" | "email";
export type LeadStatus =
  | "novo"
  | "contatado"
  | "em_acompanhamento"
  | "em_proposta"
  | "fechado"
  | "perdido";
export type LeadTemperature = "nao_classificado" | "quente" | "morno" | "frio";

export type Specialist = {
  id: SpecialistId;
  slug: string;
  name: string;
  instagramUser: string;
  instagramUrl: string;
  description: string;
  photoPath: string;
  videoPath: string;
  whatsapp: string;
  email: string;
  active: boolean;
};

export type Campaign = {
  id: number;
  title: string;
  subtitle: string;
  segment: Goal;
  credit: number;
  term: number;
  adminRate: number;
  insuranceRate: number;
  reducedPercent: number;
  featured: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Lead = {
  id: number;
  name: string;
  contactValue: string;
  contactType: ContactType;
  goal: Goal;
  credit: number;
  term: number;
  estimatedInstallment: number;
  status: LeadStatus;
  temperature: LeadTemperature;
  preferredSpecialistId: SpecialistId | null;
  assignedSpecialistId: SpecialistId | null;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: SpecialistId | null;
};

export const SPECIALISTS: Specialist[] = [
  {
    id: "flavio",
    slug: "flavio-calegario",
    name: "Flávio Calegário",
    instagramUser: "@recolfordconsorcio",
    instagramUrl: "https://www.instagram.com/recolfordconsorcio/",
    description:
      "Atuação com Consórcio Disal no Acre, veículos novos e seminovos e simulação sem compromisso.",
    photoPath: "/media/specialists/flavio/profile.jpg",
    videoPath: "/media/specialists/flavio/intro.mp4",
    whatsapp: "",
    email: "",
    active: true,
  },
  {
    id: "jessica",
    slug: "jessica-reis",
    name: "Jéssica Reis",
    instagramUser: "@jessicareis.rb",
    instagramUrl: "https://www.instagram.com/jessicareis.rb/",
    description:
      "Atendimento em Rio Branco/AC e planejamento para aquisição de veículos por consórcio.",
    photoPath: "/media/specialists/jessica/profile.jpg",
    videoPath: "/media/specialists/jessica/intro.mp4",
    whatsapp: "",
    email: "",
    active: true,
  },
  {
    id: "jersey",
    slug: "jersey-neves",
    name: "Jersey Neves",
    instagramUser: "@jerseyneves.consocios",
    instagramUrl: "https://www.instagram.com/jerseyneves.consocios/",
    description: "Biografia profissional pendente de confirmação.",
    photoPath: "/media/specialists/jersey/profile-1.jpg",
    videoPath: "/media/specialists/jersey/intro.mp4",
    whatsapp: "",
    email: "",
    active: true,
  },
];

export const BRAND_ASSETS = {
  teamLogoPath: "",
  institutionalImagePath: "",
};

export const LEAD_STATUSES: Array<{ value: LeadStatus; label: string }> = [
  { value: "novo", label: "Novo" },
  { value: "contatado", label: "Contatado" },
  { value: "em_acompanhamento", label: "Em acompanhamento" },
  { value: "em_proposta", label: "Em proposta" },
  { value: "fechado", label: "Fechado" },
  { value: "perdido", label: "Perdido" },
];

export const LEAD_TEMPERATURES: Array<{ value: LeadTemperature; label: string }> = [
  { value: "nao_classificado", label: "Não classificado" },
  { value: "quente", label: "Quente" },
  { value: "morno", label: "Morno" },
  { value: "frio", label: "Frio" },
];

const GOAL_LABELS: Record<Goal, string> = {
  carro: "Automóveis",
  imovel: "Imóveis",
  moto: "Motocicletas",
};

const LEAD_STATUS_LABELS = Object.fromEntries(
  LEAD_STATUSES.map((item) => [item.value, item.label]),
) as Record<LeadStatus, string>;

const LEAD_TEMPERATURE_LABELS = Object.fromEntries(
  LEAD_TEMPERATURES.map((item) => [item.value, item.label]),
) as Record<LeadTemperature, string>;

export const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: -1,
    title: "Seu automóvel novo começa aqui",
    subtitle: "Crédito para planejar sua próxima troca com tranquilidade.",
    segment: "carro",
    credit: 150000,
    term: 84,
    adminRate: 16,
    insuranceRate: 0.08168,
    reducedPercent: 75,
    featured: true,
    active: true,
  },
  {
    id: -2,
    title: "O plano da sua casa própria",
    subtitle: "Organize a compra, construção ou reforma do seu imóvel.",
    segment: "imovel",
    credit: 300000,
    term: 180,
    adminRate: 20,
    insuranceRate: 0.08168,
    reducedPercent: 75,
    featured: false,
    active: true,
  },
  {
    id: -3,
    title: "Duas rodas, um novo caminho",
    subtitle: "Planos para motocicletas a partir de R$ 20 mil.",
    segment: "moto",
    credit: 30000,
    term: 60,
    adminRate: 16,
    insuranceRate: 0.08168,
    reducedPercent: 75,
    featured: false,
    active: true,
  },
];

export function calculateInstallment({
  credit,
  term,
  adminRate,
  insuranceRate,
  reducedPercent,
  reduced,
}: {
  credit: number;
  term: number;
  adminRate: number;
  insuranceRate: number;
  reducedPercent: number;
  reduced: boolean;
}) {
  const fundAndFee = (credit * (1 + adminRate / 100)) / term;
  const monthlyInsurance = credit * (insuranceRate / 100);
  const fullInstallment = fundAndFee + monthlyInsurance;
  return reduced ? fullInstallment * (reducedPercent / 100) : fullInstallment;
}

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

export function goalLabel(goal: Goal) {
  return GOAL_LABELS[goal];
}

export function statusLabel(status: LeadStatus) {
  return LEAD_STATUS_LABELS[status];
}

export function temperatureLabel(temperature: LeadTemperature) {
  return LEAD_TEMPERATURE_LABELS[temperature];
}

export function activeSpecialists() {
  return SPECIALISTS.filter((specialist) => specialist.active);
}

export function getSpecialist(id: SpecialistId | null | undefined) {
  return SPECIALISTS.find((specialist) => specialist.id === id) ?? null;
}

export function getSpecialistBySlug(slug: string) {
  return SPECIALISTS.find((specialist) => specialist.slug === slug) ?? null;
}

export function specialistName(id: SpecialistId | null | undefined) {
  return getSpecialist(id)?.name ?? "Não atribuído";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function whatsappUrl(message: string, phoneNumber: string) {
  return `https://wa.me/${normalizePhone(phoneNumber)}?text=${encodeURIComponent(message)}`;
}
