# Message Queue Idempotency

## Message Queue Idempotency

```typescript
interface Message {
  id: string;
  data: any;
  timestamp: number;
}

class IdempotentMessageProcessor {
  private processedMessages = new Set<string>();
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
    this.loadProcessedMessages();
  }

  private async loadProcessedMessages(): Promise<void> {
    // Load recent processed message IDs
    const result = await this.db.query(`
      SELECT message_id
      FROM processed_messages
      WHERE processed_at > NOW() - INTERVAL '24 hours'
    `);

    result.rows.forEach((row) => {
      this.processedMessages.add(row.message_id);
    });
  }

  async processMessage(message: Message): Promise<void> {
    // Check if already processed
    if (this.processedMessages.has(message.id)) {
      console.log(`Message ${message.id} already processed, skipping`);
      return;
    }

    // Mark as processing (atomic operation)
    const wasInserted = await this.markAsProcessing(message.id);

    if (!wasInserted) {
      console.log(`Message ${message.id} already being processed`);
      return;
    }

    try {
      // Process message
      await this.handleMessage(message);

      // Mark as completed
      await this.markAsCompleted(message.id);

      this.processedMessages.add(message.id);
    } catch (error) {
      console.error(`Failed to process message ${message.id}:`, error);
      await this.markAsFailed(message.id, (error as Error).message);
      throw error;
    }
  }

  private async markAsProcessing(messageId: string): Promise<boolean> {
    try {
      await this.db.query(
        `
        INSERT INTO processed_messages (message_id, status, processed_at)
        VALUES ($1, 'processing', NOW())
      `,
        [messageId],
      );

      return true;
    } catch (error: any) {
      if (error.code === "23505") {
        return false;
      }
      throw error;
    }
  }

  private async markAsCompleted(messageId: string): Promise<void> {
    await this.db.query(
      `
      UPDATE processed_messages
      SET status = 'completed', completed_at = NOW()
      WHERE message_id = $1
    `,
      [messageId],
    );
  }

  private async markAsFailed(messageId: string, error: string): Promise<void> {
    await this.db.query(
      `
      UPDATE processed_messages
      SET status = 'failed', error = $2, completed_at = NOW()
      WHERE message_id = $1
    `,
      [messageId, error],
    );
  }

  private async handleMessage(message: Message): Promise<void> {
    // Actual message processing logic
    console.log("Processing message:", message);
  }
}
```
