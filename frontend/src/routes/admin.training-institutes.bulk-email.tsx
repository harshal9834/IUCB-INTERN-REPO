import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '../components/reusable-components';
import { BulkEmailWizard } from '../components/bulk-email/BulkEmailWizard';

export const Route = createFileRoute('/admin/training-institutes/bulk-email')({
  component: BulkEmailPage,
});

function BulkEmailPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Send Bulk Email"
        description="Automate certificate generation and email dispatch for multiple candidates."
      />
      <BulkEmailWizard />
    </div>
  );
}
