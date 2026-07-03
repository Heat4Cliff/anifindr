// Background Worker — scheduled ingestion and reindex
// Jalankan dengan: npm run worker

import { runIngestionPipeline } from "../lib/ingestion/pipeline";

console.log("🔧 Worker started...");

// Auto-sync top anime setiap 6 jam
async function scheduleSync() {
  const SIX_HOURS = 6 * 60 * 60 * 1000;

  async function run() {
    console.log(`[Worker] Starting scheduled sync at ${new Date().toISOString()}`);
    try {
      const result = await runIngestionPipeline("top", 4);
      console.log(`[Worker] Sync done: ${result.itemsDone} anime, ${result.itemsSkipped} skipped`);
    } catch (err) {
      console.error(`[Worker] Sync failed:`, err);
    }
  }

  // Run immediately on start
  await run();

  // Then schedule
  setInterval(run, SIX_HOURS);
}

scheduleSync();
