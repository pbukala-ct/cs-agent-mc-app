import React from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import AgentListView from './views/AgentListView';
import AgentCreateView from './views/AgentCreateView';
import AgentEditView from './views/AgentEditView';
import AuditLogView from './views/AuditLogView';

// The MC App Kit mounts the app at /:projectKey/cs-agent-management
export default function AppRoutes() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/agents/new`} component={AgentCreateView} />
      <Route path={`${path}/agents/:key/edit`} component={AgentEditView} />
      <Route path={`${path}/agents`} component={AgentListView} />
      <Route path={`${path}/audit`} component={AuditLogView} />
      <Redirect from={path} to={`${path}/agents`} />
    </Switch>
  );
}
