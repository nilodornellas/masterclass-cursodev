import database from "infra/database.js";

async function status(request, response) {
  const updateAt = new Date().toISOString();
  const databaseName = process.env.POSTGRES_DB;

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseMaxConnectionsResult = await database.query("SHOW max_connections;");
  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName]
  });

  response.status(200).json({
    updated_at: updateAt,
    dependencies: {
      database: {
        version: databaseVersionResult.rows[0].server_version,
        max_connections: databaseMaxConnectionsResult.rows[0].max_connections,
        opened_connections: databaseOpenedConnectionsResult.rows[0].count,
      },
    },
  });
}

export default status