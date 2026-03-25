import React, { useEffect, useState, useCallback } from 'react';
import { CustomFormMainPage } from '@commercetools-frontend/application-components';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import AuditLogTable from '../components/AuditLogTable';
import { useCtClient } from '../lib/useCtClient';
import type { AuditEntry } from '../lib/types';

const PAGE_SIZE = 25;

interface Filters {
  agentId: string;
  dateFrom: string;
  dateTo: string;
  actionType: string;
}

export default function AuditLogView() {
  const ct = useCtClient();
  const [entries, setEntries] = useState<Array<{ key: string; value: AuditEntry }>>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    agentId: '',
    dateFrom: '',
    dateTo: '',
    actionType: '',
  });
  const [agentOptions, setAgentOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { entries: data, total: t } = await ct.listAuditEntries({
        agentId: filters.agentId || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setEntries(data);
      setTotal(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }, [filters.agentId, filters.dateFrom, filters.dateTo, page, ct]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    ct.listAgents()
      .then((agents) =>
        setAgentOptions(
          agents.map((a) => ({ value: a.value.agentId, label: a.value.name }))
        )
      )
      .catch(() => {});
  }, [ct]);

  function handleFilterChange(newFilters: Filters) {
    setFilters(newFilters);
    setPage(0);
  }

  return (
    <CustomFormMainPage title="Audit Log">
      <Spacings.Stack scale="l">
        {loading && <LoadingSpinner />}
        {error && <Text.Body tone="critical">{error}</Text.Body>}
        {!loading && !error && (
          <AuditLogTable
            entries={entries}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            agents={agentOptions}
            filters={filters}
            onFilterChange={handleFilterChange}
            onPageChange={setPage}
          />
        )}
      </Spacings.Stack>
    </CustomFormMainPage>
  );
}
