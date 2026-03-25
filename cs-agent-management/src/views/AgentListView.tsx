import React, { useEffect, useState, useCallback } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { CustomFormMainPage } from '@commercetools-frontend/application-components';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import AgentList from '../components/AgentList';
import { useCtClient } from '../lib/useCtClient';
import type { AgentRecord } from '../lib/types';

interface AgentRow {
  key: string;
  value: AgentRecord;
}

export default function AgentListView() {
  const { url: base } = useRouteMatch(); // e.g. /{projectKey}/cs-agent-management/agents
  const ct = useCtClient();

  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ct.listAgents();
      setAgents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  }, [ct]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CustomFormMainPage title="CS Agents">
      <Spacings.Stack scale="l">
        {loading && <LoadingSpinner />}
        {error && <Text.Body tone="critical">{error}</Text.Body>}
        {!loading && !error && (
          <AgentList agents={agents} basePath={base} onRefresh={load} />
        )}
      </Spacings.Stack>
    </CustomFormMainPage>
  );
}
