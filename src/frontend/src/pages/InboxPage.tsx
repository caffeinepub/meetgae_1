import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllConversations } from '../hooks/useQueries';
import InboxList from '../components/messages/InboxList';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function InboxPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: conversations = [], isLoading, refetch } = useGetAllConversations();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inbox</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <InboxList conversations={conversations} isLoading={isLoading} />
    </div>
  );
}

