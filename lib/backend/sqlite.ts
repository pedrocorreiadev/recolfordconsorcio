import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync, type SQLInputValue, type StatementSync } from "node:sqlite";

import {
  DEFAULT_CAMPAIGNS,
  SPECIALISTS,
  type AdminActorId,
  type Campaign,
  type Goal,
  type Lead,
  type LeadStatus,
  type LeadTemperature,
  type SpecialistId,
} from "@/lib/consorcio";
import type { CampaignInput, CampaignUpdate, LeadInput, LeadUpdate, Repository } from "@/lib/backend/types";

type Row = Record<string, unknown>;

let database: DatabaseSync | null = null;

function sqlitePath() {
  return process.env.SQLITE_DB_PATH || path.join(process.cwd(), ".local-data", "recol-consorcio.sqlite");
}

function ensureDatabase() {
  if (database) return database;
  const dbPath = sqlitePath();
  const directory = path.dirname(dbPath);
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec("pragma foreign_keys = on;");
  applyMigrations(database);
  seedSpecialists(database);
  seedCampaigns(database);
  return database;
}

function applyMigrations(db: DatabaseSync) {
  db.exec("create table if not exists schema_migrations (version text primary key, applied_at text not null default (datetime('now')));");
  const migrationsDir = path.join(process.cwd(), "database", "migrations");
  const files = readdirSync(migrationsDir).filter((file) => file.endsWith("_sqlite.sql")).toSorted();
  for (const file of files) {
    const version = file.split("_")[0];
    const exists = db.prepare("select version from schema_migrations where version = ?").get(version);
    if (exists) continue;
    db.exec(readFileSync(path.join(migrationsDir, file), "utf8"));
    db.prepare("insert into schema_migrations (version) values (?)").run(version);
  }
}

function seedSpecialists(db: DatabaseSync) {
  const statement = db.prepare(`
    insert into specialists (
      id, slug, name, instagram_user, instagram_url, description,
      photo_path, video_path, whatsapp, email, active, updated_at
    )
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    on conflict(id) do update set
      slug = excluded.slug,
      name = excluded.name,
      instagram_user = excluded.instagram_user,
      instagram_url = excluded.instagram_url,
      description = excluded.description,
      photo_path = excluded.photo_path,
      video_path = excluded.video_path,
      whatsapp = excluded.whatsapp,
      email = excluded.email,
      active = excluded.active,
      updated_at = datetime('now')
  `);

  for (const specialist of SPECIALISTS) {
    statement.run(
      specialist.id,
      specialist.slug,
      specialist.name,
      specialist.instagramUser,
      specialist.instagramUrl,
      specialist.description,
      specialist.photoPath,
      specialist.videoPath,
      specialist.whatsapp,
      specialist.email,
      specialist.active ? 1 : 0,
    );
  }
}

function seedCampaigns(db: DatabaseSync) {
  const count = db.prepare("select count(*) as total from campaigns").get() as { total: number };
  if (count.total > 0) return;
  const statement = db.prepare(`
    insert into campaigns (
      title, subtitle, segment, credit, term, admin_rate, insurance_rate,
      reduced_percent, featured, active, created_at, updated_at
    )
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  for (const campaign of DEFAULT_CAMPAIGNS) {
    statement.run(
      campaign.title,
      campaign.subtitle,
      campaign.segment,
      campaign.credit,
      campaign.term,
      campaign.adminRate,
      campaign.insuranceRate,
      campaign.reducedPercent,
      campaign.featured ? 1 : 0,
      campaign.active ? 1 : 0,
    );
  }
}

function campaignFromRow(row: Row): Campaign {
  return {
    id: Number(row.id),
    title: String(row.title),
    subtitle: String(row.subtitle ?? ""),
    segment: String(row.segment) as Goal,
    credit: Number(row.credit),
    term: Number(row.term),
    adminRate: Number(row.admin_rate),
    insuranceRate: Number(row.insurance_rate),
    reducedPercent: Number(row.reduced_percent),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function leadFromRow(row: Row): Lead {
  return {
    id: Number(row.id),
    name: String(row.name),
    contactValue: String(row.contact_value),
    contactType: String(row.contact_type) as Lead["contactType"],
    goal: String(row.goal) as Goal,
    credit: Number(row.credit),
    term: Number(row.term),
    estimatedInstallment: Number(row.estimated_installment),
    status: String(row.status) as LeadStatus,
    temperature: String(row.temperature) as LeadTemperature,
    preferredSpecialistId: row.preferred_specialist_id ? String(row.preferred_specialist_id) as SpecialistId : null,
    assignedSpecialistId: row.assigned_specialist_id ? String(row.assigned_specialist_id) as SpecialistId : null,
    adminNotes: String(row.admin_notes ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    updatedBy: row.updated_by ? String(row.updated_by) as AdminActorId : null,
  };
}

function patchSql(table: string, id: number, values: Record<string, unknown>) {
  const entries = Object.entries(values);
  if (entries.length === 0) return null;
  const setSql = entries.map(([key]) => `${key} = ?`).join(", ");
  return {
    sql: `update ${table} set ${setSql}, updated_at = datetime('now') where id = ?`,
    values: [...entries.map(([, value]) => value), id],
  };
}

function getCampaign(db: DatabaseSync, id: number) {
  const row = db.prepare("select * from campaigns where id = ?").get(id) as Row | undefined;
  return row ? campaignFromRow(row) : null;
}

function getLead(db: DatabaseSync, id: number) {
  const row = db.prepare("select * from leads where id = ?").get(id) as Row | undefined;
  return row ? leadFromRow(row) : null;
}

function recordLeadTransfer(
  db: DatabaseSync,
  leadId: number,
  fromSpecialistId: SpecialistId | null,
  toSpecialistId: SpecialistId | null,
  adminId: AdminActorId,
) {
  db.prepare(`
    insert into lead_transfers (
      lead_id, from_specialist_id, to_specialist_id, admin_id, created_at
    )
    values (?, ?, ?, ?, datetime('now'))
  `).run(leadId, fromSpecialistId, toSpecialistId, adminId);
}

function runStatement(statement: StatementSync, values: unknown[]) {
  return statement.run(...(values as SQLInputValue[]));
}

export function createSqliteRepository(): Repository {
  return {
    async listCampaigns(includeInactive = false) {
      const db = ensureDatabase();
      const sql = includeInactive
        ? "select * from campaigns order by featured desc, created_at desc"
        : "select * from campaigns where active = 1 order by featured desc, created_at desc";
      return (db.prepare(sql).all() as Row[]).map(campaignFromRow);
    },

    async createCampaign(input: CampaignInput) {
      const db = ensureDatabase();
      const result = db.prepare(`
        insert into campaigns (
          title, subtitle, segment, credit, term, admin_rate, insurance_rate,
          reduced_percent, featured, active, created_at, updated_at
        )
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        input.title,
        input.subtitle,
        input.segment,
        input.credit,
        input.term,
        input.adminRate,
        input.insuranceRate,
        input.reducedPercent,
        input.featured ? 1 : 0,
        input.active ? 1 : 0,
      );
      return Number(result.lastInsertRowid);
    },

    async updateCampaign(id: number, changes: CampaignUpdate) {
      const db = ensureDatabase();
      const update = patchSql("campaigns", id, {
        ...(changes.title !== undefined ? { title: changes.title } : {}),
        ...(changes.subtitle !== undefined ? { subtitle: changes.subtitle } : {}),
        ...(changes.segment !== undefined ? { segment: changes.segment } : {}),
        ...(changes.credit !== undefined ? { credit: changes.credit } : {}),
        ...(changes.term !== undefined ? { term: changes.term } : {}),
        ...(changes.adminRate !== undefined ? { admin_rate: changes.adminRate } : {}),
        ...(changes.insuranceRate !== undefined ? { insurance_rate: changes.insuranceRate } : {}),
        ...(changes.reducedPercent !== undefined ? { reduced_percent: changes.reducedPercent } : {}),
        ...(changes.featured !== undefined ? { featured: changes.featured ? 1 : 0 } : {}),
        ...(changes.active !== undefined ? { active: changes.active ? 1 : 0 } : {}),
      });
      if (!update) return getCampaign(db, id);
      runStatement(db.prepare(update.sql), update.values);
      return getCampaign(db, id);
    },

    async removeCampaign(id: number) {
      ensureDatabase().prepare("delete from campaigns where id = ?").run(id);
    },

    async listLeads() {
      return (ensureDatabase().prepare("select * from leads order by created_at desc").all() as Row[]).map(leadFromRow);
    },

    async createLead(input: LeadInput) {
      const db = ensureDatabase();
      const result = db.prepare(`
        insert into leads (
          name, contact_value, contact_type, goal, credit, term, estimated_installment,
          status, temperature, preferred_specialist_id, assigned_specialist_id,
          admin_notes, created_at, updated_at
        )
        values (?, ?, ?, ?, ?, ?, ?, 'novo', 'nao_classificado', ?, ?, '', datetime('now'), datetime('now'))
      `).run(
        input.name,
        input.contactValue,
        input.contactType,
        input.goal,
        input.credit,
        input.term,
        input.estimatedInstallment,
        input.preferredSpecialistId,
        input.preferredSpecialistId,
      );
      return Number(result.lastInsertRowid);
    },

    async updateLead(id: number, changes: LeadUpdate, updatedBy: AdminActorId) {
      const db = ensureDatabase();
      const shouldRecordTransfer = changes.assignedSpecialistId !== undefined;
      const previousLead = shouldRecordTransfer ? getLead(db, id) : null;
      const update = patchSql("leads", id, {
        ...(changes.status !== undefined ? { status: changes.status } : {}),
        ...(changes.temperature !== undefined ? { temperature: changes.temperature } : {}),
        ...(changes.assignedSpecialistId !== undefined ? { assigned_specialist_id: changes.assignedSpecialistId } : {}),
        ...(changes.adminNotes !== undefined ? { admin_notes: changes.adminNotes } : {}),
        updated_by: updatedBy,
      });
      if (!update) return getLead(db, id);
      runStatement(db.prepare(update.sql), update.values);
      const updatedLead = getLead(db, id);
      if (
        shouldRecordTransfer &&
        previousLead &&
        updatedLead &&
        previousLead.assignedSpecialistId !== updatedLead.assignedSpecialistId
      ) {
        recordLeadTransfer(
          db,
          id,
          previousLead.assignedSpecialistId,
          updatedLead.assignedSpecialistId,
          updatedBy,
        );
      }
      return updatedLead;
    },

    async removeLead(id: number) {
      const db = ensureDatabase();
      db.prepare("delete from lead_transfers where lead_id = ?").run(id);
      db.prepare("delete from leads where id = ?").run(id);
    },
  };
}
