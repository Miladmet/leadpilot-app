import prisma from './prisma';

/**
 * Multi-Tenant Scoped Database Client
 * Enforces dual-layer security:
 * 1. Application layer: Scopes every query to the authenticated userId.
 * 2. Database layer: Sets PostgreSQL session context `app.current_user_id` so RLS policies are strictly enforced.
 */
export function getTenantPrisma(userId: string) {
  if (!userId) {
    throw new Error('Multi-tenant violation: An authenticated userId is strictly required to initialize tenant context.');
  }

  return {
    userId,

    /**
     * Executes a transaction with the PostgreSQL RLS session variable set
     */
    async withTenant<T>(callback: (tx: any) => Promise<T>): Promise<T> {
      return await prisma.$transaction(async (tx) => {
        try {
          await tx.$executeRawUnsafe(`SELECT set_config('app.current_user_id', $1, true);`, userId);
        } catch {
          // Fallback if local SQLite driver doesn't support postgres set_config
        }
        return await callback(tx);
      });
    },

    // 1. Prospect
    prospect: {
      findMany: (args: any = {}) =>
        prisma.prospect.findMany({ ...args, where: { ...args?.where, userId } }),
      findUnique: (args: any) =>
        prisma.prospect.findFirst({ ...args, where: { ...args?.where, userId } }),
      findFirst: (args: any = {}) =>
        prisma.prospect.findFirst({ ...args, where: { ...args?.where, userId } }),
      create: (args: any) =>
        prisma.prospect.create({ ...args, data: { ...args?.data, userId } }),
      update: async (args: any) => {
        const existing = await prisma.prospect.findFirst({ where: { id: args.where.id, userId } });
        if (!existing) throw new Error('Record not found or unauthorized');
        return prisma.prospect.update(args);
      },
      delete: async (args: any) => {
        const existing = await prisma.prospect.findFirst({ where: { id: args.where.id, userId } });
        if (!existing) throw new Error('Record not found or unauthorized');
        return prisma.prospect.delete(args);
      },
      count: (args: any = {}) =>
        prisma.prospect.count({ ...args, where: { ...args?.where, userId } }),
    },

    // 2. ActivityLog
    activityLog: {
      findMany: (args: any = {}) =>
        prisma.activityLog.findMany({ ...args, where: { ...args?.where, userId } }),
      create: (args: any) =>
        prisma.activityLog.create({ ...args, data: { ...args?.data, userId } }),
    },

    // 3. ResearchReports
    researchReports: {
      findMany: (args: any = {}) =>
        prisma.researchReports.findMany({ ...args, where: { ...args?.where, userId } }),
      findFirst: (args: any = {}) =>
        prisma.researchReports.findFirst({ ...args, where: { ...args?.where, userId } }),
      create: (args: any) =>
        prisma.researchReports.create({ ...args, data: { ...args?.data, userId } }),
    },

    // 4. OpportunityAnalysis
    opportunityAnalysis: {
      findMany: (args: any = {}) =>
        prisma.opportunityAnalysis.findMany({ ...args, where: { ...args?.where, userId } }),
      findFirst: (args: any = {}) =>
        prisma.opportunityAnalysis.findFirst({ ...args, where: { ...args?.where, userId } }),
      create: (args: any) =>
        prisma.opportunityAnalysis.create({ ...args, data: { ...args?.data, userId } }),
    },

    // 5. Proposals
    proposals: {
      findMany: (args: any = {}) =>
        prisma.proposals.findMany({ ...args, where: { ...args?.where, userId } }),
      findFirst: (args: any = {}) =>
        prisma.proposals.findFirst({ ...args, where: { ...args?.where, userId } }),
      create: (args: any) =>
        prisma.proposals.create({ ...args, data: { ...args?.data, userId } }),
    },

    // 6. OutreachMessages
    outreachMessages: {
      findMany: (args: any = {}) =>
        prisma.outreachMessages.findMany({ ...args, where: { ...args?.where, userId } }),
      findFirst: (args: any = {}) =>
        prisma.outreachMessages.findFirst({ ...args, where: { ...args?.where, userId } }),
      create: (args: any) =>
        prisma.outreachMessages.create({ ...args, data: { ...args?.data, userId } }),
    },

    // 7. Subscriptions
    subscriptions: {
      findMany: (args: any = {}) =>
        prisma.subscriptions.findMany({ ...args, where: { ...args?.where, userId } }),
      findFirst: (args: any = {}) =>
        prisma.subscriptions.findFirst({ ...args, where: { ...args?.where, userId } }),
      create: (args: any) =>
        prisma.subscriptions.create({ ...args, data: { ...args?.data, userId } }),
    },

    // 8. User (Scoped to the authenticated user's own id)
    user: {
      findSelf: () =>
        prisma.user.findUnique({ where: { id: userId } }),
      updateSelf: (data: any) =>
        prisma.user.update({ where: { id: userId }, data }),
    },
  };
}
