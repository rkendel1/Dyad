import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dyadApiClient, DyadApp } from '../api/api-client';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom'; // Import Link for navigation

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
            <Card key={app.id}>
              <CardHeader>
                <CardTitle>{app.name}</CardTitle>
                <CardDescription>Path: {app.path}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Created: {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</p>
              </CardContent>
              <CardFooter>
                <Link to={`/app/${app.id}`}> {/* Example link to an app detail page */}
                  <Button variant="outline">View App</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">No applications found. Make sure Dyad Desktop is running and you have created apps.</div>
      )}
    </div>
  );
}

export default AppsPage;