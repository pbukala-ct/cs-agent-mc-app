/**
 * Hook for making authenticated CT REST API calls through the MC proxy.
 *
 * Uses @commercetools-frontend/sdk's action creators + useAsyncDispatch,
 * which adds the Authorization: Bearer token from the MC session automatically.
 * Raw fetch() with credentials: 'include' only sends cookies — it does NOT
 * add the bearer token header the MC proxy requires, hence 401 errors.
 */
import { useMemo } from 'react';
import { useAsyncDispatch, actions } from '@commercetools-frontend/sdk';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import type { AgentRecord, AuditEntry } from './types';

interface CustomObjectsResponse<T> {
  results: Array<{ key: string; value: T }>;
  total: number;
}

export interface AuditFilters {
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export function useCtClient() {
  const dispatch = useAsyncDispatch();
  const projectKey = useApplicationContext((ctx) => ctx.project?.key ?? '');

  return useMemo(() => {
    function ctGet<T>(path: string): Promise<T> {
      return dispatch(
        actions.get({
          uri: `/${projectKey}${path}`,
          mcApiProxyTarget: 'ctp',
        })
      ) as Promise<T>;
    }

    function ctPost<T>(path: string, body: unknown): Promise<T> {
      return dispatch(
        actions.post({
          uri: `/${projectKey}${path}`,
          mcApiProxyTarget: 'ctp',
          payload: body,
        })
      ) as Promise<T>;
    }

    return {
      async listAgents(): Promise<Array<{ key: string; value: AgentRecord }>> {
        const data = await ctGet<CustomObjectsResponse<AgentRecord>>(
          '/custom-objects/agent-credentials?limit=500&sort=createdAt+asc'
        );
        return data.results;
      },

      async upsertAgent(key: string, value: AgentRecord): Promise<void> {
        await ctPost('/custom-objects', {
          container: 'agent-credentials',
          key,
          value,
        });
      },

      async listAuditEntries(
        filters: AuditFilters = {}
      ): Promise<{ entries: Array<{ key: string; value: AuditEntry }>; total: number }> {
        const limit = filters.limit ?? 25;
        const offset = filters.offset ?? 0;

        const data = await ctGet<CustomObjectsResponse<AuditEntry>>(
          '/custom-objects/agent-audit-log?limit=500&sort=createdAt+desc'
        );

        let results = data.results;

        if (filters.agentId) {
          results = results.filter((r) => r.value.agentId === filters.agentId);
        }
        if (filters.dateFrom) {
          const from = new Date(filters.dateFrom).getTime();
          results = results.filter(
            (r) => new Date(r.value.timestamp).getTime() >= from
          );
        }
        if (filters.dateTo) {
          const to = new Date(filters.dateTo).getTime();
          results = results.filter(
            (r) => new Date(r.value.timestamp).getTime() <= to
          );
        }

        const total = results.length;
        const page = results.slice(offset, offset + limit);

        return { entries: page, total };
      },
    };
  }, [dispatch, projectKey]);
}
