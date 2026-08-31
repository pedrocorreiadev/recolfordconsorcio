import type {
  Campaign,
  ContactType,
  Goal,
  Lead,
  LeadStatus,
  LeadTemperature,
  AdminActorId,
  SpecialistId,
} from "@/lib/consorcio";

export type CampaignInput = Omit<Campaign, "id" | "createdAt" | "updatedAt">;

export type CampaignUpdate = Partial<CampaignInput>;

export type LeadInput = {
  name: string;
  contactValue: string;
  contactType: ContactType;
  goal: Goal;
  credit: number;
  term: number;
  estimatedInstallment: number;
  preferredSpecialistId: SpecialistId | null;
};

export type LeadUpdate = {
  status?: LeadStatus;
  temperature?: LeadTemperature;
  assignedSpecialistId?: SpecialistId | null;
  adminNotes?: string;
};

export type Repository = {
  listCampaigns(includeInactive?: boolean): Promise<Campaign[]>;
  createCampaign(input: CampaignInput): Promise<number>;
  updateCampaign(id: number, changes: CampaignUpdate): Promise<Campaign | null>;
  removeCampaign(id: number): Promise<void>;
  listLeads(): Promise<Lead[]>;
  createLead(input: LeadInput): Promise<number>;
  updateLead(id: number, changes: LeadUpdate, updatedBy: AdminActorId): Promise<Lead | null>;
  removeLead(id: number): Promise<void>;
};
