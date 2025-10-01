import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dyadApiClient, DyadApp } from '../api/api-client';
import { formatDistanceToNow } from 'date-fns';

function AppsPage() {
  const { data: apps, isLoading, error } = useQuery<DyadApp[], Error>({
    queryKey: ['dyadApps'],
    queryFn: () => dyadApiClient.getApps(),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Your Dyad Applications</h2>
      {apps && apps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <div key={app.id} className="bg-card text-card-foreground p-4 rounded-lg shadow-sm border border-border">
              <h3 className="text-lg font-medium mb-2">{app.name}</h3>
              <p className="text-sm text-muted-foreground mb-1">Path: {app.path}</p>
              <p className="text-xs text-muted-foreground">Created: {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">No applications found. Make sure Dyad Desktop is running and you have created apps.</div>
      )}
    </div>
  );
}

export default AppsPage;