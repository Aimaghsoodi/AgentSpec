/**
 * Express API with AgentSpec Middleware
 */

import express, { Request, Response, NextFunction } from 'express';
import { AgentSpec } from '@agentspec/core';

export function agentSpecMiddleware(options: {
  specFile: string;
  auditLog?: boolean;
}) {
  let spec: AgentSpec;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!spec) {
        spec = AgentSpec.fromFile(options.specFile);
      }

      const action = req.method.toLowerCase() + '_' + req.path;
      const capability = spec.capabilities.find(c => c.action === action);

      if (!capability) {
        return res.status(403).json({ error: 'Action not allowed' });
      }

      // Check boundaries
      for (const boundary of spec.boundaries) {
        if (boundary.action === action) {
          return res.status(403).json({ error: 'Boundary violation' });
        }
      }

      // Audit log
      if (options.auditLog) {
        console.log(`[AgentSpec] Allowing ${action}`);
      }

      next();
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  };
}

export function createProtectedAPI(specFile: string) {
  const app = express();

  app.use(express.json());
  app.use(agentSpecMiddleware({ specFile, auditLog: true }));

  app.post('/api/action', (req: Request, res: Response) => {
    res.json({ success: true });
  });

  return app;
}
