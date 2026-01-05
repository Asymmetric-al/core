/**
 * @deprecated Import from '@/lib/mock-data' instead
 * 
 * This file is kept for backward compatibility.
 * All mock data has been moved to src/lib/mock-data/
 */

export { 
  WORKER_FEEDS, 
  RECENT_UPDATES,
  getWorkerFeeds,
  getRecentUpdates,
  getTransactionHistory,
  getDonorPledges,
  type WorkerFeed,
  type RecentUpdate,
  type TransactionRecord,
  type PledgeRecord,
} from '../mock-data'

export { 
  DONATIONS as MOCK_TRANSACTIONS,
  PLEDGES as MOCK_PLEDGES,
} from '../mock-data'
