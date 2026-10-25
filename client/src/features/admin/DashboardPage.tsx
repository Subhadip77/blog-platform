import { useQuery } from '@tanstack/react-query';
import { Spinner } from '../../components/Spinner';
import { adminApi } from './api';

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminApi.stats });
  if (isLoading) return <Spinner />;
  if (isError || !data) return <p className="text-danger">Could not load stats.</p>;

  const cards = [
    { label: 'Total users', value: data.users },
    { label: 'Total posts', value: data.posts },
    { label: 'Total comments', value: data.comments },
    { label: 'Deleted posts', value: data.deletedPosts },
  ];
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-line bg-surface p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-1 text-3xl font-bold text-primary">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}