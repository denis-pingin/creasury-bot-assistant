import { Client, Intents } from 'discord.js';
import { getInviterTag, getUserTag, logObject, sendLogMessage } from './util';
import * as inviteTracker from './invite-tracker';
import { config } from './config';
import * as db from "./db";

export function createClient() {
  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  });

  return client;
}

export function addEventHandlers(client) {
  client.once('ready', async () => {
    try {
      await sendLogMessage(client, 'Creasury Bot Assistant ready to help!');

      inviteTracker.init(client);
    } catch (err) {
      logObject('OnReady error:', err);
    }
  });

  client.on('inviteCreate', async invite => {
    try {
      if (invite.guild.id !== config.guildId) return;

      logObject('inviteCreate event:', invite);

      await inviteTracker.handleInviteCreate(invite);

      await sendLogMessage(client, `A new invite code "${invite.code}" was created by ${getUserTag(invite.inviter)} for channel <#${invite.channel.id}>.`);
    } catch (err) {
      logObject('OnInviteCreate error:', err);
    }
  });

  client.on('guildMemberAdd', async member => {
    try {
      if (member.guild.id !== config.guildId) return;

      logObject('guildMemberAdd event:', member);

      // Determine the inviter
      const inviter = await inviteTracker.handleJoin(member);

      // Log
      await sendLogMessage(client, `New member joined ${getUserTag(member.user)} invited by ${getInviterTag(inviter)}.`);

      // Check account age
      const fake = Date.now() - member.user.createdAt < 1000 * 60 * 60 * 24 * config.minAccountAge;

      // Create event
      await db.addJoinEvent(member, inviter, fake);
    } catch (err) {
      logObject('OnGuildMemberAdd error:', err);
    }
  });

  client.on('guildMemberRemove', async member => {
    try {
      if (member.guild.id !== config.guildId) return;

      logObject('guildMemberRemove event:', member);

      // Log
      await sendLogMessage(client, `Member left: ${getUserTag(member.user)}.`);

      // Create event
      await db.addLeaveEvent(member);
    } catch (err) {
      logObject('OnGuildMemberRemove error:', err);
    }
  });
}

export function login(client, token) {
  client.login(token);
}