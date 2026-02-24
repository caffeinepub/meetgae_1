import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetDiscoveryUsers } from '../hooks/useQueries';
import UserCard from '../components/users/UserCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { LoadingState, EmptyState } from '../components/system/QueryState';

export default function DiscoveryPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useGetDiscoveryUsers();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.bio.toLowerCase().includes(query)
    );
  });

  const currentUserId = identity.getPrincipal().toString();
  const otherUsers = filteredUsers.filter(user => user.id.toString() !== currentUserId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Discover People</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or bio..."
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : otherUsers.length === 0 ? (
        <EmptyState
          message={
            searchQuery
              ? 'No users found matching your search.'
              : 'No users to discover yet. Check back later!'
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherUsers.map((user) => (
            <UserCard key={user.id.toString()} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

