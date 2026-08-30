import core from './dbSelfHealCore';

export const SAFE_CORE_PROSPECT_SELECT = core.SAFE_CORE_PROSPECT_SELECT;
export const POSTGRES_SELF_HEAL_STATEMENTS = core.POSTGRES_SELF_HEAL_STATEMENTS;
export const selfHealDatabaseSchema = core.selfHealDatabaseSchema as (prismaClient: any) => Promise<{ success?: boolean; skipped?: boolean; reason?: string; executedCount?: number }>;
export const normalizeProspectDefaults = core.normalizeProspectDefaults as (record: any) => any;
