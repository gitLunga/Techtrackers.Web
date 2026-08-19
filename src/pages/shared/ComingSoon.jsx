/**
 * src/pages/shared/ComingSoon.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The rebuild is being done foundation-first: theme, shell, API layer and
 *   three reference screens, reviewed, THEN the remaining screens. Routes for
 *   screens not yet rebuilt need to resolve to something honest in the meantime.
 *
 * WHAT IT ACHIEVES
 *   A clearly-labelled placeholder, so navigating the app shows the real
 *   structure and nothing silently 404s or renders blank. Delete this file once
 *   every route has a real screen.
 */
import { Card, CardContent } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function ComingSoon({ title = 'Screen' }) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <CardContent>
          <EmptyState
            icon={ConstructionIcon}
            title={`${title} is being rebuilt`}
            description="This screen is part of the UI overhaul and will be rebuilt on the new design system once the reference screens are signed off."
          />
        </CardContent>
      </Card>
    </>
  );
}
