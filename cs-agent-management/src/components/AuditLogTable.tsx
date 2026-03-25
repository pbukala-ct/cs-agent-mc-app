import React, { useState } from 'react';
import { InfoModalPage } from '@commercetools-frontend/application-components';
import DataTable from '@commercetools-uikit/data-table';
import SelectField from '@commercetools-uikit/select-field';
import TextField from '@commercetools-uikit/text-field';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import Stamp from '@commercetools-uikit/stamp';
import type { AuditEntry } from '../lib/types';

interface AgentOption {
  value: string;
  label: string;
}

interface AuditLogTableProps {
  entries: Array<{ key: string; value: AuditEntry }>;
  total: number;
  page: number;
  pageSize: number;
  agents: AgentOption[];
  filters: {
    agentId: string;
    dateFrom: string;
    dateTo: string;
    actionType: string;
  };
  onFilterChange: (filters: AuditLogTableProps['filters']) => void;
  onPageChange: (page: number) => void;
}

const OUTCOME_TONES: Record<string, 'positive' | 'critical'> = {
  success: 'positive',
  failure: 'critical',
};

export default function AuditLogTable({
  entries,
  total,
  page,
  pageSize,
  agents,
  filters,
  onFilterChange,
  onPageChange,
}: AuditLogTableProps) {
  const [selectedEntry, setSelectedEntry] = useState<{ key: string; value: AuditEntry } | null>(null);

  function handleFilter(partial: Partial<AuditLogTableProps['filters']>) {
    onFilterChange({ ...filters, ...partial });
    onPageChange(0);
  }

  function clearFilters() {
    onFilterChange({ agentId: '', dateFrom: '', dateTo: '', actionType: '' });
    onPageChange(0);
  }

  // Client-side action-type filter
  const displayed = filters.actionType
    ? entries.filter((e) =>
        e.value.actionType
          .toLowerCase()
          .includes(filters.actionType.toLowerCase())
      )
    : entries;

  const totalPages = Math.ceil(total / pageSize);

  const columns = [
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'agentName', label: 'Agent' },
    { key: 'actionType', label: 'Action' },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'outcome', label: 'Outcome' },
    { key: 'expand', label: '' },
  ];

  const rows = displayed.map((entry) => ({
    id: entry.key,
    timestamp: (
      <Text.Body>{new Date(entry.value.timestamp).toLocaleString()}</Text.Body>
    ),
    agentName: <Text.Body>{entry.value.agentName}</Text.Body>,
    actionType: <Stamp tone="primary">{entry.value.actionType}</Stamp>,
    customerId: (
      <Text.Body tone="secondary">{entry.value.customerId ?? '—'}</Text.Body>
    ),
    outcome: (
      <Stamp tone={OUTCOME_TONES[entry.value.outcome] ?? 'primary'}>
        {entry.value.outcome}
      </Stamp>
    ),
    expand: (
      <SecondaryButton
        size="small"
        label="Details"
        onClick={() => setSelectedEntry(entry)}
      />
    ),
  }));

  return (
    <Spacings.Stack scale="m">
      {/* Filter bar */}
      <Spacings.Inline>
        <SelectField
          title="Agent"
          value={filters.agentId}
          onChange={(e) => handleFilter({ agentId: e.target.value })}
          options={[{ value: '', label: 'All agents' }, ...agents]}
          horizontalConstraint={7}
        />
        <TextField
          title="Date from"
          value={filters.dateFrom}
          onChange={(e) => handleFilter({ dateFrom: e.target.value })}
          type="date"
          horizontalConstraint={7}
        />
        <TextField
          title="Date to"
          value={filters.dateTo}
          onChange={(e) => handleFilter({ dateTo: e.target.value })}
          type="date"
          horizontalConstraint={7}
        />
        <TextField
          title="Action type"
          value={filters.actionType}
          onChange={(e) => handleFilter({ actionType: e.target.value })}
          placeholder="Filter by action..."
          horizontalConstraint={7}
        />
        <Spacings.Inline alignItems="flex-end">
          <SecondaryButton label="Clear filters" onClick={clearFilters} />
        </Spacings.Inline>
      </Spacings.Inline>

      <DataTable columns={columns} rows={rows} />

      <InfoModalPage
        title={selectedEntry ? `${selectedEntry.value.actionType} — detail` : ''}
        isOpen={selectedEntry !== null}
        onClose={() => setSelectedEntry(null)}
        topBarPreviousPathLabel="Audit Log"
        topBarCurrentPathLabel="Detail"
      >
        {selectedEntry && (
          <Spacings.Stack scale="m">
            <Spacings.Stack scale="xs">
              <Text.Detail tone="secondary">Timestamp</Text.Detail>
              <Text.Body>{new Date(selectedEntry.value.timestamp).toLocaleString()}</Text.Body>
            </Spacings.Stack>
            <Spacings.Stack scale="xs">
              <Text.Detail tone="secondary">Agent</Text.Detail>
              <Text.Body>{selectedEntry.value.agentName}</Text.Body>
            </Spacings.Stack>
            <Spacings.Stack scale="xs">
              <Text.Detail tone="secondary">Action type</Text.Detail>
              <Stamp tone="primary">{selectedEntry.value.actionType}</Stamp>
            </Spacings.Stack>
            <Spacings.Stack scale="xs">
              <Text.Detail tone="secondary">Outcome</Text.Detail>
              <Stamp tone={OUTCOME_TONES[selectedEntry.value.outcome] ?? 'primary'}>
                {selectedEntry.value.outcome}
              </Stamp>
            </Spacings.Stack>
            {selectedEntry.value.customerId && (
              <Spacings.Stack scale="xs">
                <Text.Detail tone="secondary">Customer ID</Text.Detail>
                <Text.Body>{selectedEntry.value.customerId}</Text.Body>
              </Spacings.Stack>
            )}
            {selectedEntry.value.failureReason && (
              <Spacings.Stack scale="xs">
                <Text.Detail tone="secondary">Failure reason</Text.Detail>
                <Text.Body tone="critical">{selectedEntry.value.failureReason}</Text.Body>
              </Spacings.Stack>
            )}
            {selectedEntry.value.actionDetail && Object.keys(selectedEntry.value.actionDetail).length > 0 && (
              <Spacings.Stack scale="xs">
                <Text.Detail tone="secondary">Action detail</Text.Detail>
                {Object.entries(selectedEntry.value.actionDetail).map(([k, v]) => (
                  <Spacings.Inline key={k} scale="s">
                    <Text.Detail tone="secondary" isBold>{k}:</Text.Detail>
                    <Text.Detail>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</Text.Detail>
                  </Spacings.Inline>
                ))}
              </Spacings.Stack>
            )}
          </Spacings.Stack>
        )}
      </InfoModalPage>

      {/* Pagination */}
      {totalPages > 1 && (
        <Spacings.Inline>
          <SecondaryButton
            label="Previous"
            isDisabled={page === 0}
            onClick={() => onPageChange(page - 1)}
          />
          <Text.Body>
            Page {page + 1} of {totalPages}
          </Text.Body>
          <SecondaryButton
            label="Next"
            isDisabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
          />
        </Spacings.Inline>
      )}
    </Spacings.Stack>
  );
}
