require('dotenv').config();

export const config = {
  token: `${process.env.DISCORD_TOKEN}`,
  clientId: `${process.env.DISCORD_CLIENT_ID}`,
  guildId: `${process.env.DISCORD_GUILD_ID}`,
  dbConnectionString: `${process.env.DB_CONNECTION_STRING}`,
  dbName: `${process.env.DB_NAME}`,
};

if (!config.clientId) throw new Error('Client ID was not provided');
if (!config.guildId) throw new Error('Guild ID was not provided');
if (!config.token) throw new Error('Token was not provided');
if (!config.dbConnectionString) throw new Error('DB connection string was not provided');
if (!config.dbName) throw new Error('DB name was not provided');
