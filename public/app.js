const statusEl = document.querySelector('#status');
const databaseEl = document.querySelector('#database');
const migrationsEl = document.querySelector('#migrations');

try {
  const response = await fetch('/api/health', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Health request failed: ${response.status}`);
  const health = await response.json();
  statusEl.textContent = `${health.phase} / ${health.gate}`;
  databaseEl.textContent = health.database.status;
  migrationsEl.textContent = String(health.database.migrations);
} catch (error) {
  statusEl.textContent = 'Unavailable';
  databaseEl.textContent = 'Unknown';
  console.error(error);
}
