import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch, useParams } from 'react-router-dom';
import { CustomFormMainPage } from '@commercetools-frontend/application-components';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Text from '@commercetools-uikit/text';
import AgentForm from '../components/AgentForm';
import { useCtClient } from '../lib/useCtClient';
import type { AgentRecord } from '../lib/types';

export default function AgentEditView() {
  const history = useHistory();
  const { key } = useParams<{ key: string }>();
  const { url } = useRouteMatch(); // e.g. /{projectKey}/cs-agent-management/agents/{key}/edit
  const agentsUrl = url.replace(/\/[^/]+\/edit$/, '');

  const ct = useCtClient();
  const [agent, setAgent] = useState<{ key: string; value: AgentRecord } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ct.listAgents()
      .then((agents) => {
        const found = agents.find((a) => a.key === key);
        if (!found) setError('Agent not found');
        else setAgent(found);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load agent'))
      .finally(() => setLoading(false));
  }, [key, ct]);

  return (
    <CustomFormMainPage title="Edit agent">
      {loading && <LoadingSpinner />}
      {error && <Text.Body tone="critical">{error}</Text.Body>}
      {agent && (
        <AgentForm
          mode="edit"
          agentKey={agent.key}
          initial={agent.value}
          onSuccess={() => history.push(agentsUrl)}
          onCancel={() => history.push(agentsUrl)}
        />
      )}
    </CustomFormMainPage>
  );
}
