import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { CustomFormMainPage } from '@commercetools-frontend/application-components';
import AgentForm from '../components/AgentForm';

export default function AgentCreateView() {
  const history = useHistory();
  const { url } = useRouteMatch(); // e.g. /{projectKey}/cs-agent-management/agents/new
  const agentsUrl = url.replace(/\/new$/, '');

  return (
    <CustomFormMainPage title="Add agent">
      <AgentForm
        mode="create"
        onSuccess={() => history.push(agentsUrl)}
        onCancel={() => history.push(agentsUrl)}
      />
    </CustomFormMainPage>
  );
}
