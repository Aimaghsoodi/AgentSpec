# Express API with AgentSpec Middleware

Protect Express API endpoints with AgentSpec-defined permissions.

## What This Does

- Load AgentSpec file
- Check request permissions against spec
- Enforce capability and boundary constraints
- Audit all operations

## Installation

```bash
npm install express agentspec
```

## Usage

```typescript
import { agentSpecMiddleware } from '@agentspec/express';

const app = express();
app.use(agentSpecMiddleware({ specFile: 'api.agentspec.yaml' }));
```

## Example

```typescript
app.post('/api/refund', agentSpecMiddleware(), async (req, res) => {
  // Middleware checks: Can agent call refund?
  // Middleware checks: Is amount within boundaries?
  // Request allowed: execute handler
});
```

## Features

- Permission checking
- Constraint validation
- Audit logging
- Error handling

## See Also

- Implementation: `src/server.ts`
