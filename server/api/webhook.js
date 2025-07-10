import { WebApp } from 'meteor/webapp';
import bodyParser from 'body-parser';
import { ModerationPolicies } from '/imports/api/moderation/collection';
import { hasBlockedWords, replaceBlockedWords } from '/imports/api/blocklist/collection';

const jsonParser = bodyParser.json();

// Helper: Safely get the value from an object by a dot-separated path.
function getValueByPath(obj, pathStr) {
  const path = pathStr.split('.');
  let current = obj;
  for (const key of path) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return current;
}

// Helper: Safely set the value into an object by a dot-separated path.
function setValueByPath(obj, pathStr, value) {
  const path = pathStr.split('.');
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  const lastKey = path[path.length - 1];
  current[lastKey] = value;
}

WebApp.connectHandlers.use('/webhook/moderate', jsonParser, async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('Method Not Allowed');
    return;
  }

  try {
    console.log("Received webhook:", req.body);
    const { msg_id, from, to, chat_type, payload } = req.body;
    const messageBody = payload?.bodies?.[0] || {};


    const messageType = messageBody.type || 'txt';
    const policies = await ModerationPolicies.findOneAsync({ type: messageType });
    console.log("Moderation policies for type:", messageType, policies);

    const response = { valid: true };

    if (!policies || policies.action === 'No Action') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      return;
    }

    let content = '';
    if (messageType === 'txt') {
      content = messageBody.msg;
    } else if (messageType === 'custom') {
      content = getValueByPath(messageBody.customExts?.[0] || {}, policies.fields?.[0] || '');
    }
    if (!content) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      return;
    }
    console.log("Content to check:", content);
    const action = policies.action;

    if (content && hasBlockedWords(content)) {
      if (action === 'Block From Sending') {
        response.valid = false;
        response.code = "This message contains blocked content";
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        return;
      }

      if (messageBody.type === 'txt' && action === 'Replace With Asterisks (*)') {
        const result = await replaceBlockedWords(content);
        messageBody.msg = result.updatedText;
        response.payload = payload;
      } else if (messageBody.type === 'custom' && action === 'Replace With Asterisks (*)') {
        const result = await replaceBlockedWords(content);
        setValueByPath(messageBody.customExts?.[0] || {}, policies.fields?.[0] || '', result.updatedText);
        response.payload = payload;
        console.log("Custom message type detected, replacing blocked words, fields:", policies.fields);
      }
    }
    console.log("Final response ", response);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (err) {
    console.error('Webhook error:', err);
    res.writeHead(500);
    res.end('Internal Error');
  }
});
