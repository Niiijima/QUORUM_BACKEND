// seed.js
const axios = require('axios');

const API_BASE = 'http://localhost:3000'; // adjust if your API runs elsewhere

async function registerUser() {
  const user = {
    name: "Seed User",
    email: "seeduser@example.com",
    password: "123456"
  };

  try {
    const res = await axios.post(`${API_BASE}/register`, user);
    console.log("✅ User registered:", res.data);
    return res.data.id || res.data.userId; // adjust based on your API response
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log("ℹ️ User already exists:", user.email);
      return 1; // fallback userId if your API returns conflict
    } else {
      console.error("❌ Error registering user:", err.message);
      throw err;
    }
  }
}

async function fundWallet(userId) {
  try {
    const res = await axios.post(`${API_BASE}/wallet/fund`, {
      userId,
      amount: 100
    });
    console.log(`✅ Wallet funded for user ${userId}:`, res.data);
  } catch (err) {
    console.error("❌ Error funding wallet:", err.message);
  }
}

async function castVote(userId) {
  try {
    const res = await axios.post(`${API_BASE}/vote`, {
      userId,
      candidateId: 2 // adjust to a real candidate ID
    });
    console.log(`✅ Vote cast by user ${userId}:`, res.data);
  } catch (err) {
    console.error("❌ Error casting vote:", err.message);
  }
}

async function exportResults() {
  try {
    const res = await axios.get(`${API_BASE}/export`);
    console.log("📊 Exported results:", res.data);
  } catch (err) {
    console.error("❌ Error exporting results:", err.message);
  }
}

async function runSeedFlow() {
  try {
    const userId = await registerUser();
    await fundWallet(userId);
    await castVote(userId);
    await exportResults();
    console.log("🎯 Seed flow completed successfully!");
  } catch (err) {
    console.error("❌ Seed flow failed:", err.message);
  }
}

runSeedFlow();
