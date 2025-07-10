import { Mongo } from 'meteor/mongo';

export const ModerateLogs = new Mongo.Collection('moderate_logs');
export const ModerationPolicies = new Mongo.Collection('moderation_policies');
