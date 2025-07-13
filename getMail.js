const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const API = 'https://api.mail.tm';

async function createMailAccount() {
  const email = `${uuidv4().slice(0,8)}@mail.tm`;
  const password = 'TempPass123!';
  await axios.post(`${API}/accounts`, { address: email, password });
  const tok = await axios.post(`${API}/token`, { address: email, password });
  return { address: email, token: tok.data.token };
}

async function getOTP(token) {
  for (let i = 0; i < 20; i++) {
    const res = await axios.get(`${API}/messages`, { headers: { Authorization: `Bearer ${token}` } });
    const msgs = res.data['hydra:member'];
    if (msgs.length > 0) {
      const msg = await axios.get(`${API}/messages/${msgs[0].id}`, { headers: { Authorization: `Bearer ${token}` } });
      const m = msg.data.text.match(/\\b\\d{6}\\b/);
      if (m) return m[0];
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('OTP not found');
}

module.exports = { createMailAccount, getOTP };
