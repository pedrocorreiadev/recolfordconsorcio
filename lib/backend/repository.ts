import { DEFAULT_CAMPAIGNS, type Campaign, type Lead } from "@/lib/consorcio";

type CampaignInput = Omit<Campaign, "id" | "createdAt">;
type LeadInput = Omit<Lead, "id" | "status" | "createdAt"> & { consent: boolean };

type MemoryStore = {
  campaigns: Campaign[];
  leads: Lead[];
  nextCampaignId: number;
  nextLeadId: number;
};

declare global {
  var pedraoMemoryStore: MemoryStore | undefined;
}

function getStore(): MemoryStore {
  if (!globalThis.pedraoMemoryStore) {
    globalThis.pedraoMemoryStore = {
      campaigns: DEFAULT_CAMPAIGNS.map((item, index) => ({ ...item, id: index + 1 })),
      leads: [],
      nextCampaignId: DEFAULT_CAMPAIGNS.length + 1,
      nextLeadId: 1,
    };
  }
  return globalThis.pedraoMemoryStore;
}

// Adaptador temporário para desenvolvimento. Substitua estas funções pela
// implementação do banco escolhido sem alterar os contratos das APIs.
export async function listCampaigns(includeInactive = false) {
  const items = getStore().campaigns.filter((item) => includeInactive || item.active);
  return items.toSorted((a, b) => Number(b.featured) - Number(a.featured)).map((item) => ({ ...item }));
}

export async function createCampaign(input: CampaignInput) {
  const store = getStore();
  const id = store.nextCampaignId++;
  store.campaigns.unshift({ ...input, id, createdAt: new Date().toISOString() });
  return id;
}

export async function updateCampaign(id: number, active: boolean, featured: boolean) {
  const item = getStore().campaigns.find((campaign) => campaign.id === id);
  if (item) Object.assign(item, { active, featured });
}

export async function removeCampaign(id: number) {
  const store = getStore();
  store.campaigns = store.campaigns.filter((campaign) => campaign.id !== id);
}

export async function listLeads() {
  return getStore().leads.map((item) => ({ ...item }));
}

export async function createLead(input: LeadInput) {
  const store = getStore();
  const id = store.nextLeadId++;
  store.leads.unshift({
    id,
    name: input.name,
    phone: input.phone,
    goal: input.goal,
    credit: input.credit,
    term: input.term,
    estimatedInstallment: input.estimatedInstallment,
    status: "novo",
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function updateLeadStatus(id: number, status: Lead["status"]) {
  const item = getStore().leads.find((lead) => lead.id === id);
  if (item) item.status = status;
}
