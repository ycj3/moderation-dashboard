import { Meteor } from 'meteor/meteor';
import { Blocklist } from '/imports/api/blocklist/collection';
import '/imports/api/blocklist/methods';
import '/server/api/webhook.js';
import { ModerateLogs } from '/imports/api/moderation/collection';
import '/imports/api/moderation/methods';

Meteor.publish('blocklist', function () {
  return Blocklist.find();
});

Meteor.publish('moderateLogs', function (page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const cursor = ModerateLogs.find({}, {
    sort: { createdAt: -1 },
    skip,
    limit
  });
  return cursor;
});

Meteor.publish('moderateLogsCount', function () {
  return ModerateLogs.find({}, { fields: { _id: 1 } });
});