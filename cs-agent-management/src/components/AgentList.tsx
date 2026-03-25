import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import DataTable from '@commercetools-uikit/data-table';
import PrimaryButton from '@commercetools-uikit/primary-button';
import IconButton from '@commercetools-uikit/icon-button';
import { ConfirmationDialog } from '@commercetools-frontend/application-components';
import Stamp from '@commercetools-uikit/stamp';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { PlusBoldIcon, EditIcon } from '@commercetools-uikit/icons';
import type { AgentRecord } from '../lib/types';
import { useCtClient } from '../lib/useCtClient';

interface AgentRow {
  key: string;
  value: AgentRecord;
}

interface AgentListProps {
  agents: AgentRow[];
  basePath: string;
  onRefresh: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  'read-only': 'Read-only',
  'order-placement': 'Order placement',
};

export default function AgentList({ agents, basePath, onRefresh }: AgentListProps) {
  const history = useHistory();
  const ct = useCtClient();
  const [confirmToggle, setConfirmToggle] = useState<AgentRow | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleToggleActive() {
    if (!confirmToggle) return;
    setBusy(true);
    try {
      await ct.upsertAgent(confirmToggle.key, {
        ...confirmToggle.value,
        active: !confirmToggle.value.active,
      });
      onRefresh();
    } finally {
      setBusy(false);
      setConfirmToggle(null);
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'lastLoginAt', label: 'Last login' },
    { key: 'actions', label: '' },
  ];

  const rows = agents.map((agent) => ({
    id: agent.key,
    name: (
      <Text.Body
        isBold
        tone={agent.value.active === false ? 'secondary' : 'primary'}
      >
        {agent.value.name}
      </Text.Body>
    ),
    email: (
      <Text.Body tone={agent.value.active === false ? 'secondary' : 'primary'}>
        {agent.value.email}
      </Text.Body>
    ),
    role: <Stamp tone="primary">{ROLE_LABELS[agent.value.role] ?? agent.value.role}</Stamp>,
    status:
      agent.value.active === false ? (
        <Stamp tone="critical">Deactivated</Stamp>
      ) : (
        <Stamp tone="positive">Active</Stamp>
      ),
    lastLoginAt: (
      <Text.Body tone="secondary">
        {agent.value.lastLoginAt
          ? new Date(agent.value.lastLoginAt).toLocaleString()
          : '—'}
      </Text.Body>
    ),
    actions: (
      <Spacings.Inline>
        <IconButton
          icon={<EditIcon />}
          label="Edit"
          size="small"
          onClick={() => history.push(`${basePath}/${agent.key}/edit`)}
        />
        <PrimaryButton
          size="small"
          tone={agent.value.active === false ? 'primary' : 'urgent'}
          label={agent.value.active === false ? 'Reactivate' : 'Deactivate'}
          onClick={() => setConfirmToggle(agent)}
        />
      </Spacings.Inline>
    ),
  }));

  return (
    <>
      <Spacings.Stack scale="m">
        <Spacings.Inline justifyContent="flex-end">
          <PrimaryButton
            iconLeft={<PlusBoldIcon />}
            label="Add agent"
            onClick={() => history.push(`${basePath}/new`)}
          />
        </Spacings.Inline>
        <DataTable columns={columns} rows={rows} />
      </Spacings.Stack>

      {confirmToggle && (
        <ConfirmationDialog
          title={
            confirmToggle.value.active === false
              ? 'Reactivate agent'
              : 'Deactivate agent'
          }
          onClose={() => setConfirmToggle(null)}
          onCancel={() => setConfirmToggle(null)}
          onConfirm={handleToggleActive}
          isOpen
          isPrimaryButtonDisabled={busy}
        >
          <Text.Body>
            {confirmToggle.value.active === false
              ? `Reactivate ${confirmToggle.value.name}? They will be able to log in again.`
              : `Deactivate ${confirmToggle.value.name}? They will not be able to log in until reactivated. Their history is preserved.`}
          </Text.Body>
        </ConfirmationDialog>
      )}
    </>
  );
}
