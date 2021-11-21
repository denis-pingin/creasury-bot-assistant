import { config } from './config';
import * as util from 'util';
import * as db from './db';

export async function sendLogMessage(client, message) {
  console.log(`#log: ${message}`);

  if (!client) return;

  const guildConfig = await db.getGuildConfig(config.guildId);

  if (guildConfig.logChannelId) {
    const channel = client.channels.cache.get(guildConfig.logChannelId);
    if (channel) {
      await channel.send(message);
    } else {
      console.warn(`Log channel with ID ${guildConfig.logChannelId} not found!`);
    }
  } else {
    console.warn('Log channel ID not configured');
  }
}

export function getInviterTag(user) {
  if (!user) return 'some mysterious force';
  return getUserTag(user);
}

export function getUserTag(user) {
  if (!user) return 'unknown member';
  return `<@${user.id}>`;
}

export function logObject(message, object) {
  console.log(message, util.inspect(object, { showHidden: false, depth: null, colors: true }));
}
