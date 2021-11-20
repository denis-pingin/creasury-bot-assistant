import { config } from './config';
import * as util from 'util';

export async function sendLogMessage(client, message) {
  console.log(`#log: ${message}`);

  if (!client) return;

  const channel = client.channels.cache.get(config.logChannelId);
  if (!channel) {
    console.log('Warning: log channel not found');
  } else {
    await channel.send(message);
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
