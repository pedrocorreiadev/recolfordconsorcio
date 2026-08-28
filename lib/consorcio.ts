export type Goal = "carro" | "imovel" | "moto";

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
};

export type Lead = {
  id: number;
  name: string;
  phone: string;
  goal: Goal;
  credit: number;
  term: number;
  estimatedInstallment: number;
  status: "novo" | "contatado" | "proposta" | "fechado";
  createdAt: string;
};

export const WHATSAPP_NUMBER = "5568999162099";

const GOAL_LABELS: Record<Goal, string> = {
  carro: "Automóveis",
  imovel: "Imóveis",
  moto: "Motocicletas",
};

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

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
