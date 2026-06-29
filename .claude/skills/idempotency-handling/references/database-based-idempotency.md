# Database-Based Idempotency

## Database-Based Idempotency

```typescript
import { Pool } from "pg";

interface IdempotencyRecord {
  key: string;
  request_body: any;
  response_body?: any;
  status: string;
  error_message?: string;
  created_at: Date;
  completed_at?: Date;
}

class DatabaseIdempotency {
  constructor(private db: Pool) {
    this.createTable();
  }

  private async createTable(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS idempotency_keys (
        key VARCHAR(255) PRIMARY KEY,
        request_body JSONB NOT NULL,
        response_body JSONB,
        status VARCHAR(50) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_idempotency_expires
      ON idempotency_keys (expires_at);
    `);
  }

  async checkIdempotency(
    key: string,
    requestBody: any,
  ): Promise<IdempotencyRecord | null> {
    const result = await this.db.query(
      "SELECT * FROM idempotency_keys WHERE key = $1",
      [key],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const record = result.rows[0];

    // Check if request body matches
    if (JSON.stringify(record.request_body) !== JSON.stringify(requestBody)) {
      throw new Error("Request body mismatch for idempotency key");
    }

    return record;
  }

  async startProcessing(key: string, requestBody: any): Promise<boolean> {
    try {
      const expiresAt = new Date(Date.now() + 86400 * 1000); // 24 hours

      await this.db.query(
        `
        INSERT INTO idempotency_keys (key, request_body, status, expires_at)
        VALUES ($1, $2, 'processing', $3)
      `,
        [key, requestBody, expiresAt],
      );

      return true;
    } catch (error: any) {
      if (error.code === "23505") {
        // Unique violation
        return false;
      }
      throw error;
    }
  }

  async completeRequest(key: string, responseBody: any): Promise<void> {
    await this.db.query(
      `
      UPDATE idempotency_keys
      SET
        response_body = $1,
        status = 'completed',
        completed_at = NOW()
      WHERE key = $2
    `,
      [responseBody, key],
    );
  }

  async failRequest(key: string, errorMessage: string): Promise<void> {
    await this.db.query(
      `
      UPDATE idempotency_keys
      SET
        error_message = $1,
        status = 'failed',
        completed_at = NOW()
      WHERE key = $2
    `,
      [errorMessage, key],
    );
  }

  async cleanup(): Promise<number> {
    const result = await this.db.query(`
      DELETE FROM idempotency_keys
      WHERE expires_at < NOW()
    `);

    return result.rowCount || 0;
  }
}
```
