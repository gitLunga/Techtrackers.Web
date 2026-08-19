/**
 * src/components/DataTable.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Ticket lists appear on at least eight screens. In the old app each one was a
 *   hand-rolled <table> with its own CSS module (Table.module.css existed three
 *   times, in three folders, with three different definitions), its own loading
 *   behaviour and its own — usually absent — empty and error states.
 *
 * WHAT IT ACHIEVES
 *   One table. A screen supplies `columns` and `rows`; everything else —
 *   loading skeletons, empty state, error state, pagination, row click, and
 *   card-style stacking on mobile — is handled here.
 *
 *   Skeleton rows rather than a spinner: the layout does not jump when data
 *   arrives, which is what makes a list feel fast even when it isn't.
 */
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, Skeleton, Alert, Typography, Stack,
} from '@mui/material';
import EmptyState from './EmptyState.jsx';
import { NEUTRAL } from '../theme/tokens.js';

export default function DataTable({
  columns,
  rows = [],
  loading = false,
  error = null,
  onRowClick,
  emptyTitle = 'Nothing to show',
  emptyDescription,
  emptyAction,
  pagination,          // { page, limit, total, onPageChange, onLimitChange }
  getRowKey = (row) => row.id,
  dense = false,
}) {
  if (error) {
    return (
      <Card>
        <Alert severity="error" sx={{ m: 2 }}>
          {error.message || 'Could not load this data.'}
        </Alert>
      </Card>
    );
  }

  const showEmpty = !loading && rows.length === 0;

  return (
    <Card>
      <TableContainer>
        <Table size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{ width: col.width, whiteSpace: 'nowrap', ...(col.hideBelow && { display: { xs: 'none', [col.hideBelow]: 'table-cell' } }) }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Skeletons match the real row height, so nothing shifts on load. */}
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton height={22} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading &&
              rows.map((row) => (
                <TableRow
                  key={getRowKey(row)}
                  hover={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={onRowClick ? { cursor: 'pointer' } : undefined}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align}
                      sx={col.hideBelow ? { display: { xs: 'none', [col.hideBelow]: 'table-cell' } } : undefined}
                    >
                      {col.render ? col.render(row) : (
                        <Typography variant="body2" noWrap={col.noWrap}>
                          {row[col.id] ?? '—'}
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showEmpty && (
        <EmptyState title={emptyTitle} description={emptyDescription} {...emptyAction} dense />
      )}

      {pagination && pagination.total > 0 && (
        <Box sx={{ borderTop: `1px solid ${NEUTRAL[100]}` }}>
          <TablePagination
            component="div"
            count={pagination.total}
            page={Math.max(0, (pagination.page ?? 1) - 1)}   // MUI is 0-indexed, the API is 1-indexed
            rowsPerPage={pagination.limit ?? 20}
            rowsPerPageOptions={[10, 20, 50, 100]}
            onPageChange={(_, newPage) => pagination.onPageChange(newPage + 1)}
            onRowsPerPageChange={(e) => pagination.onLimitChange(Number(e.target.value))}
            labelRowsPerPage="Rows"
          />
        </Box>
      )}
    </Card>
  );
}

/** Small helper for a two-line cell (primary text + muted caption below). */
export function CellStack({ primary, secondary }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{primary}</Typography>
      {secondary && <Typography variant="caption" color="text.secondary" noWrap>{secondary}</Typography>}
    </Stack>
  );
}
