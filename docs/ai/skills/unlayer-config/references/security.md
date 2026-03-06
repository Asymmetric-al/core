# Unlayer Security Reference

Identity verification prevents impersonation of logged-in users. Generate HMAC signatures **server-side** with the project secret.

## Node.js

```javascript
const crypto = require("crypto");

const signature = crypto
  .createHmac("sha256", "YOUR_PROJECT_SECRET")
  .update(String(userId))
  .digest("hex");
```

## Python / Django

```python
import hmac
import hashlib

signature = hmac.new(
    b"YOUR_PROJECT_SECRET",
    bytes(str(request.user.id), encoding="utf-8"),
    digestmod=hashlib.sha256
).hexdigest()
```

## Client-Side Usage

```javascript
unlayer.init({
  user: {
    id: 1,
    signature: signatureFromServer,
    name: "John Doe",
    email: "john.doe@example.com",
  },
});
```

## End-User Identification

```javascript
unlayer.init({
  user: {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
  },
});
```

Rules for this repo:

- Never commit project secrets or cloud API keys.
- Keep signature generation server-side only.
- Treat any future HMAC integration like other secret-backed auth/config work in this repo.
