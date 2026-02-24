import { useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetConversation } from '../hooks/useQueries';
import ConversationThread from '../components/messages/ConversationThread';
import { Principal } from '@dfinity/principal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ConversationPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { userId } = useParams({ from: '/conversation/$userId' });

  let partnerId: Principal | null = null;
  try {
    partnerId = Principal.fromText(userId);
  } catch (e) {
    console.error('Invalid principal:', userId);
  }

  const { data: messages, isLoading, refetch } = useGetConversation(partnerId);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity || !partnerId) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/inbox' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </Button>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <ConversationThread
          partnerId={partnerId}
          messages={messages ?? null}
          isLoading={isLoading}
          onRefresh={() => refetch()}
        />
      </div>
    </div>
  );
}

