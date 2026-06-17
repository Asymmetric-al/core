# Stripe-Style Idempotency

## Stripe-Style Idempotency

```python
import hashlib
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import psycopg2

class IdempotencyManager:
    def __init__(self, db_connection):
        self.db = db_connection
        self.ttl_days = 1

    def process_request(
        self,
        idempotency_key: str,
        request_data: Dict[str, Any],
        process_fn: callable
    ) -> Dict[str, Any]:
        """
        Process request with idempotency guarantee.

        Args:
            idempotency_key: Unique key for this request
            request_data: Request payload
            process_fn: Function to process the request

        Returns:
            Response data
        """
        # Check for existing request
        existing = self.get_existing_request(
            idempotency_key,
            request_data
        )

        if existing:
            if existing['status'] == 'processing':
                raise ConflictError('Request already processing')

            if existing['status'] == 'completed':
                return existing['response']

            if existing['status'] == 'failed':
                raise ProcessingError(existing['error'])

        # Start processing
        if not self.start_processing(idempotency_key, request_data):
            raise ConflictError('Request already processing')

        try:
            # Process request
            result = process_fn(request_data)

            # Store result
            self.complete_request(idempotency_key, result)

            return result

        except Exception as e:
            # Store error
            self.fail_request(idempotency_key, str(e))
            raise

    def get_existing_request(
        self,
        key: str,
        request_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Get existing idempotent request."""
        cursor = self.db.cursor()

        cursor.execute("""
            SELECT status, response, error, request_hash
            FROM idempotency_requests
            WHERE idempotency_key = %s
            AND created_at > %s
        """, (key, datetime.now() - timedelta(days=self.ttl_days)))

        row = cursor.fetchone()
        cursor.close()

        if not row:
            return None

        # Verify request data matches
        request_hash = self.hash_request(request_data)
        if row[3] != request_hash:
            raise ValueError(
                'Request data does not match idempotency key'
            )

        return {
            'status': row[0],
            'response': row[1],
            'error': row[2]
        }

    def start_processing(
        self,
        key: str,
        request_data: Dict[str, Any]
    ) -> bool:
        """Mark request as processing."""
        cursor = self.db.cursor()
        request_hash = self.hash_request(request_data)

        try:
            cursor.execute("""
                INSERT INTO idempotency_requests
                (idempotency_key, request_hash, status, created_at)
                VALUES (%s, %s, 'processing', NOW())
            """, (key, request_hash))

            self.db.commit()
            cursor.close()
            return True

        except psycopg2.IntegrityError:
            self.db.rollback()
            cursor.close()
            return False

    def complete_request(
        self,
        key: str,
        response: Dict[str, Any]
    ):
        """Mark request as completed."""
        cursor = self.db.cursor()

        cursor.execute("""
            UPDATE idempotency_requests
            SET
                status = 'completed',
                response = %s,
                completed_at = NOW()
            WHERE idempotency_key = %s
        """, (json.dumps(response), key))

        self.db.commit()
        cursor.close()

    def fail_request(self, key: str, error: str):
        """Mark request as failed."""
        cursor = self.db.cursor()

        cursor.execute("""
            UPDATE idempotency_requests
            SET
                status = 'failed',
                error = %s,
                completed_at = NOW()
            WHERE idempotency_key = %s
        """, (error, key))

        self.db.commit()
        cursor.close()

    def hash_request(self, data: Dict[str, Any]) -> str:
        """Create hash of request data."""
        json_str = json.dumps(data, sort_keys=True)
        return hashlib.sha256(json_str.encode()).hexdigest()


class ConflictError(Exception):
    pass


class ProcessingError(Exception):
    pass


# Usage
def process_payment(data):
    # Process payment logic
    return {
        'payment_id': 'pay_123',
        'amount': data['amount'],
        'status': 'completed'
    }

# In your API handler
idempotency = IdempotencyManager(db_connection)

try:
    result = idempotency.process_request(
        idempotency_key='key_abc123',
        request_data={'amount': 100, 'currency': 'USD'},
        process_fn=process_payment
    )
    print(result)
except ConflictError as e:
    print(f"Conflict: {e}")
except ProcessingError as e:
    print(f"Processing error: {e}")
```
