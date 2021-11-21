import { config } from './config';

import { MongoClient, ReturnDocument } from 'mongodb';

const cache = {};

export function init() {
  getDatabase().then(async db => {
    db.createIndex('events', { 'type': 1 }, { name: 'type' });
    db.createIndex('events', { 'guildId': 1 }, { name: 'guildId' });
    db.createIndex('events', { 'user.id': 1 }, { name: 'userId' });
    db.createIndex('events', { 'inviter.id': 1 }, { name: 'inviterId' });
    db.createIndex('events', { 'originalInviter.id': 1 }, { name: 'originalInviterId' });
    db.createIndex('events', { 'timestamp': 1 }, { name: 'timestamp' });
    db.createIndex('events', { 'stagePoints': 1 }, { name: 'stagePoints' });
    db.createIndex('events', { 'processed': 1 }, { name: 'processed' });
  });
}

export function setConnection(connection) {
  cache.connection = connection;
}

async function getConnection() {
  if (!cache.connection) {
    console.log('Creating MongoDB connection');
    const client = new MongoClient(config.dbConnectionString);
    cache.connection = await client.connect();
  }
  return cache.connection;
}

async function getDatabase() {
  const connection = await getConnection();
  return connection.db(config.dbName);
}

export async function getGuildConfig(guildId) {
  const database = await getDatabase();
  const result = await database.collection('config').findOneAndUpdate({ guildId }, {
    $set: {
      guildId: guildId,
    },
  }, {
    upsert: true,
    returnDocument: ReturnDocument.AFTER,
  });
  const guildConfig = result.value;
  if (!guildConfig.excludedFromRanking) {
    guildConfig.excludedFromRanking = [];
  }
  return guildConfig;
}

export async function addJoinEvent(member, inviter, fake) {
  const database = await getDatabase();
  const timestamp = Date.now();
  await database.collection('events').insertOne({
    type: 'join',
    guildId: member.guild.id,
    user: member.user,
    createdAt: member.user.createdAt,
    inviter: inviter,
    fake: fake,
    timestamp: timestamp,
    processed: false,
  });
  return timestamp;
}

export async function addLeaveEvent(member) {
  const database = await getDatabase();
  const timestamp = Date.now();
  await database.collection('events').insertOne({
    type: 'leave',
    guildId: member.guild.id,
    user: member.user,
    timestamp: timestamp,
    processed: false,
  });
  return timestamp;
}

export {
  getConnection,
  getDatabase,
};