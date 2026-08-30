/**
 * LeadPilot AI Schema Error Interceptor & Structured Logger Core
 *
 * Catches Prisma schema mismatch error codes:
 * - P2021: "The table {table} does not exist in the current database."
 * - P2022: "The column {column} does not exist in the current database."
 *
 * Converts them to the user-facing alert:
 * "Database schema mismatch detected."
 *
 * And outputs structured diagnostic logs for developer and telemetry auditing.
 */

const USER_FACING_SCHEMA_ERROR = 'Database schema mismatch detected.';

function isSchemaMismatchError(err) {
  if (!err) return false;
  const code = err.code || err.prismaErrorCode || '';
  const message = err.message || '';
  return (
    code === 'P2021' ||
    code === 'P2022' ||
    message.includes('P2021') ||
    message.includes('P2022') ||
    message.includes('does not exist in the current database')
  );
}

function parsePrismaSchemaError(err, route = 'Unknown') {
  const code = err.code || (err.message?.includes('P2021') ? 'P2021' : err.message?.includes('P2022') ? 'P2022' : 'SCHEMA_MISMATCH');
  const message = err.message || '';
  
  let model = 'UnknownModel';
  let column = 'UnknownColumn';

  // Parse Table from P2021 e.g. "The table `public.Prospect` does not exist" or "table `Prospect`"
  if (code === 'P2021') {
    const tableMatch = message.match(/table `(?:public\.)?([^`]+)`/i) || message.match(/table "([^"]+)"/i);
    if (tableMatch) {
      model = tableMatch[1];
    }
  }

  // Parse Column and Table from P2022 e.g. "The column `Prospect.analysisVersion` does not exist"
  if (code === 'P2022') {
    const colMatch = message.match(/column [`"]([^`"]+)[`"]/i);
    if (colMatch) {
      const full = colMatch[1];
      const parts = full.split('.');
      if (parts.length > 1) {
        model = parts[0].replace(/^public\./i, '');
        column = parts[1];
      } else {
        column = parts[0];
      }
    }
  }

  const logEntry = {
    model,
    column,
    prismaErrorCode: code,
    route,
    timestamp: new Date().toISOString(),
    message
  };

  // Structured Logging for telemetry & developer monitoring
  console.error('[Schema Mismatch Detected]:', {
    Model: logEntry.model,
    Column: logEntry.column,
    'Prisma Error Code': logEntry.prismaErrorCode,
    Route: logEntry.route,
    Timestamp: logEntry.timestamp
  });

  return logEntry;
}

module.exports = {
  USER_FACING_SCHEMA_ERROR,
  isSchemaMismatchError,
  parsePrismaSchemaError
};
