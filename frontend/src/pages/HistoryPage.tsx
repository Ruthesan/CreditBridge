import { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, History as HistoryIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Table, type Column } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { SkeletonRow } from '../components/ui/Skeleton';
import { RunDetailModal } from '../components/analysis/RunDetailModal';
import { useRunHistory, type RunHistoryRow } from '../hooks/useRunHistory';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime, scoreTone, statusLabel, statusTone } from '../lib/utils';

const PAGE_SIZE = 8;

export default function HistoryPage() {
  const { rows, loading, error } = useRunHistory();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('started_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [openRunId, setOpenRunId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...rows];
    if (statusFilter !== 'all') result = result.filter((r) => r.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((r) => r.run_id.toLowerCase().includes(q) || r.trigger_type.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'started_at') cmp = new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
      else if (sortKey === 'score') cmp = (a.bestScore ?? -1) - (b.bestScore ?? -1);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [rows, statusFilter, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const columns: Column<RunHistoryRow>[] = [
    {
      key: 'started_at',
      header: 'Analysis Date',
      sortable: true,
      render: (r) => <span className="font-medium text-ink">{formatDateTime(r.started_at)}</span>,
    },
    {
      key: 'business',
      header: 'Business Name',
      render: () => <span className="text-ink-secondary">{user?.business_name}</span>,
    },
    {
      key: 'score',
      header: 'Credit Score',
      sortable: true,
      render: (r) =>
        r.bestScore !== null ? (
          <Badge tone={scoreTone(r.bestScore)}>{Math.round(r.bestScore)}</Badge>
        ) : (
          <span className="text-ink-secondary">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={statusTone(r.status)}>{statusLabel(r.status)}</Badge>,
    },
    {
      key: 'created_by',
      header: 'Created By',
      render: (r) => <span className="capitalize text-ink-secondary">{r.trigger_type}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <button
          onClick={() => setOpenRunId(r.run_id)}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <Eye size={14} /> View
        </button>
      ),
    },
  ];

  if (error) return <Alert variant="danger" title="Could not load history">{error}</Alert>;

  return (
    <div className="space-y-6">
      <PageHeader title="Analysis history" description="Every statement you've uploaded and how it scored." />

      {!loading && rows.length === 0 ? (
        <EmptyState icon={<HistoryIcon size={24} />} title="No analysis history yet" description="Your uploaded statements and their results will appear here." />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by run ID or trigger type…"
                className="h-10 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="sm:w-48"
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">Processing</option>
              <option value="pending">Queued</option>
              <option value="failed">Failed</option>
            </Select>
          </div>

          {loading ? (
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={6} />
              ))}
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                rows={pageRows}
                keyField={(r) => r.run_id}
                onSort={handleSort}
                sortKey={sortKey}
                sortDir={sortDir}
                emptyMessage="No runs match your filters."
              />

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-ink-secondary">
                    Page {page} of {totalPages} · {filtered.length} results
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon={<ChevronLeft size={14} />} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" iconRight={<ChevronRight size={14} />} disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <RunDetailModal runId={openRunId} onClose={() => setOpenRunId(null)} />
    </div>
  );
}
