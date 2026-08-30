import { createSqliteRepository } from "@/lib/backend/sqlite";
import { createSupabaseRepository } from "@/lib/backend/supabase";
import type { CampaignInput, CampaignUpdate, LeadInput, LeadUpdate, Repository } from "@/lib/backend/types";
import type { SpecialistId } from "@/lib/consorcio";

export type { CampaignInput, CampaignUpdate, LeadInput, LeadUpdate } from "@/lib/backend/types";

let repository: Repository | null = null;

function providerName() {
  return process.env.DATA_PROVIDER || (process.env.NODE_ENV === "production" ? "supabase" : "sqlite");
}

function getRepository() {
  if (repository) return repository;
  const provider = providerName();
  if (provider === "sqlite") {
    repository = createSqliteRepository();
    return repository;
  }
  if (provider === "supabase") {
    repository = createSupabaseRepository();
    return repository;
  }
  throw new Error(`DATA_PROVIDER inválido: ${provider}`);
}

export async function listCampaigns(includeInactive = false) {
  return getRepository().listCampaigns(includeInactive);
}

export async function createCampaign(input: CampaignInput) {
  return getRepository().createCampaign(input);
}

export async function updateCampaign(id: number, changes: CampaignUpdate) {
  return getRepository().updateCampaign(id, changes);
}

export async function removeCampaign(id: number) {
  return getRepository().removeCampaign(id);
}

export async function listLeads() {
  return getRepository().listLeads();
}

export async function createLead(input: LeadInput) {
  return getRepository().createLead(input);
}

export async function updateLead(id: number, changes: LeadUpdate, updatedBy: SpecialistId) {
  return getRepository().updateLead(id, changes, updatedBy);
}
