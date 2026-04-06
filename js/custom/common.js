// common.js
function formatCurrency(amount) {
  return `₹${parseFloat(amount).toFixed(2)}`;
}

function showMessage(message, type = "info") {
  alert(message); // Replace with custom toast if needed
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function generateId(prefix = "id") {
  return prefix + "_" + Math.random().toString(36).substring(2, 10);
}

