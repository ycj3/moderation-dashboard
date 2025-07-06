import { WebApp } from 'meteor/webapp';
import bodyParser from 'body-parser';
import { ModerateLogs } from '/imports/api/moderation/collection';
import { callAzureModeration } from '/imports/api/moderation/methods';

const jsonParser = bodyParser.json();

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
    const content = messageBody.msg;

    if (!content) {
      res.writeHead(400);
      res.end('Empty message');
      return;
    }

    const result = await callAzureModeration(content);

    await ModerateLogs.insertAsync({
      messageId: msg_id,
      senderId: from,
      receiverId: to,
      chatType: chat_type,
      content,
      moderation: result,
      createdAt: new Date()
    });

    const response = {
      valid: true,
      modify_msg: null,
      modify_ext: null,
    };

    const anyViolation = result?.categoriesAnalysis?.some(c => c.severity >= 2);
    if (anyViolation) {
      response.valid = false;
      response.code = "This message contains blocked content";
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (err) {
    console.error('Webhook error:', err);
    res.writeHead(500);
    res.end('Internal Error');
  }
});
