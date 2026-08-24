/**
 * src/components/AssetStatusChip.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Same pattern as StatusChip.jsx (ticket status) and PriorityChip.jsx: one
 *   place owning how an asset's lifecycle state looks and reads, so it can't
 *   drift between the assets table and anywhere else it's shown.
 */
import { Chip } from '@mui/material';
import { STATUS } from '../theme/tokens.js';

export const ASSET_STATUS_META = {
  IN_USE:       { label: 'In use',      tone: STATUS.success },
  IN_STORAGE:   { label: 'In storage',  tone: STATUS.neutral },
  UNDER_REPAIR: { label: 'Under repair', tone: STATUS.warning },
  RETIRED:      { label: 'Retired',     tone: STATUS.error },
};

export default function AssetStatusChip({ status, size = 'small' }) {
  const meta = ASSET_STATUS_META[status] ?? { label: status ?? 'Unknown', tone: STATUS.neutral };
  return (
    <Chip
      size={size}
      label={meta.label}
      sx={{ backgroundColor: meta.tone.light, color: meta.tone.dark, border: `1px solid ${meta.tone.main}22` }}
    />
  );
}
