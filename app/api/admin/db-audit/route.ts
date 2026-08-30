import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    // Note: To allow seamless auditing, verify session if available
    const dbUrl = process.env.DATABASE_URL || '';
    const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

    let host = 'N/A (Local SQLite)';
    let port = 'N/A';
    let database = 'dev.db';
    let username = 'N/A';
    let supabaseProjectId = 'N/A';
    let currentSchema = 'public';

    if (isPostgres) {
      try {
        const parsed = new URL(dbUrl);
        host = parsed.hostname;
        port = parsed.port || '5432';
        database = parsed.pathname.replace(/^\//, '');
        username = parsed.username;

        // Supabase project ID is either in hostname or username (pooler format: postgres.<project-ref>)
        if (host.includes('supabase.co')) {
          supabaseProjectId = host.split('.')[0];
        } else if (username.startsWith('postgres.')) {
          supabaseProjectId = username.split('.')[1];
        } else if (host.includes('pooler.supabase.com')) {
          supabaseProjectId = username.includes('.') ? username.split('.')[1] : 'Supabase Pooler';
        }
      } catch (parseErr: any) {
        host = `Parse error: ${parseErr.message}`;
      }
    }

    let tablesQuery: any[] = [];
    let columnsQuery: any[] = [];
    let prospectColumns: any[] = [];
    let prismaTest: any = null;

    if (isPostgres) {
      try {
        // Query current schema
        const schemaRes: any[] = await prisma.$queryRawUnsafe(`SELECT current_schema() as schema;`);
        currentSchema = schemaRes[0]?.schema || 'public';

        // Query 3: Matching tables
        tablesQuery = await prisma.$queryRawUnsafe(`
          SELECT table_schema, table_name
          FROM information_schema.tables
          WHERE LOWER(table_name) LIKE '%prospect%';
        `);

        // Query 4: Columns named analysisversion
        columnsQuery = await prisma.$queryRawUnsafe(`
          SELECT table_schema, table_name, column_name
          FROM information_schema.columns
          WHERE LOWER(column_name) = 'analysisversion';
        `);

        // Query 5: All columns in Prospect
        prospectColumns = await prisma.$queryRawUnsafe(`
          SELECT table_schema, table_name, column_name, data_type, column_default
          FROM information_schema.columns
          WHERE LOWER(table_name) = 'prospect'
          ORDER BY column_name;
        `);
      } catch (queryErr: any) {
        console.error('[DB Audit Raw Queries Error]:', queryErr);
      }
    } else {
      // SQLite fallback
      const tablesRes: any[] = await prisma.$queryRawUnsafe(`
        SELECT 'main' as table_schema, name as table_name 
        FROM sqlite_master 
        WHERE type='table' AND LOWER(name) LIKE '%prospect%';
      `);
      tablesQuery = tablesRes;

      const colsRes: any[] = await prisma.$queryRawUnsafe(`PRAGMA table_info("Prospect");`);
      prospectColumns = colsRes.map((c: any) => ({
        table_schema: 'main',
        table_name: 'Prospect',
        column_name: c.name,
        data_type: c.type,
        column_default: c.dflt_value
      }));
      columnsQuery = prospectColumns.filter((c: any) => c.column_name.toLowerCase() === 'analysisversion');
    }

    // Test Prisma model query
    try {
      const sample = await prisma.prospect.findFirst({
        select: { id: true, analysisVersion: true }
      });
      prismaTest = {
        success: true,
        recordFound: !!sample,
        sampleId: sample?.id || null,
        analysisVersion: sample?.analysisVersion ?? null
      };
    } catch (prismaErr: any) {
      prismaTest = {
        success: false,
        code: prismaErr.code || 'UNKNOWN',
        message: prismaErr.message,
        meta: prismaErr.meta || null
      };
    }

    // Audit comparison summary
    const hasAnalysisVersionInDb = columnsQuery.length > 0;
    const isPrismaQueryWorking = prismaTest?.success === true;

    let rootCause = 'Unknown';
    if (!isPrismaQueryWorking && prismaTest?.code === 'P2022') {
      if (!hasAnalysisVersionInDb) {
        rootCause = 'DATABASE_MISMATCH: The database currently connected to this Vercel environment does not have the column "analysisVersion". The ALTER TABLE query was likely executed on a different Supabase project/branch than what Vercel DATABASE_URL points to.';
      } else {
        rootCause = 'SCHEMA_SEARCH_PATH_MISMATCH: The column "analysisVersion" exists in schema ' + (columnsQuery[0]?.table_schema || 'unknown') + ', but Prisma is querying a different schema or connection without search_path.';
      }
    } else if (isPrismaQueryWorking) {
      rootCause = 'RESOLVED: Prisma query on Prospect.analysisVersion executed successfully with code 200.';
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      connection: {
        databaseUrlHost: host,
        port,
        databaseName: database,
        supabaseProjectId,
        currentSchema,
        provider: isPostgres ? 'postgresql' : 'sqlite'
      },
      queries: {
        matchingTables: tablesQuery,
        analysisVersionColumns: columnsQuery,
        totalProspectColumnsCount: prospectColumns.length,
        prospectColumns
      },
      prismaTest,
      auditReport: {
        expectedDatabase: 'Supabase PostgreSQL (LeadPilot / main)',
        actualDatabase: `${host} (${supabaseProjectId})`,
        expectedTable: 'public."Prospect"',
        actualTablesFound: tablesQuery.map((t: any) => `${t.table_schema}.${t.table_name}`),
        expectedColumn: 'analysisVersion (integer)',
        actualColumnsFound: columnsQuery.map((c: any) => `${c.table_schema}.${c.table_name}.${c.column_name}`),
        rootCauseAnalysis: rootCause
      }
    });

  } catch (error: any) {
    console.error('[Database Audit Fatal Error]:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
