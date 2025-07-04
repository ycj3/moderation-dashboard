import axios from 'axios';
import { check } from 'meteor/check';
import { ModerateLogs } from './collection';

const endpoint = 'https://resource-name-1.cognitiveservices.azure.com';
const apiKey = 'EqmXZpAkHKldkl3wbo1Q53yFsMtUryS20z0rikeajQecyjlAfjwZJQQJ99BFACYeBjFXJ3w3AAAHACOGlQml';

Meteor.methods({
  async 'moderation.delete'(_id) {
    check(_id, String);
    return await ModerateLogs.removeAsync(_id);
  },
  async 'moderation.count'() {
    return await ModerateLogs.find().countAsync();
  }
});

export async function callAzureModeration(text) {
  try {
    const res = await axios.post(
      `${endpoint}/contentsafety/text:analyze?api-version=2024-09-01`,
      {
        text,
        categories: ["Hate", "Sexual", "Violence", "SelfHarm"]
      },
      {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    return res.data;
  } catch (err) {
    console.error('Azure moderation error:', err?.response?.data || err);
    return { error: true };
  }
}
