import { WalkCompletePage } from '@/views/walk/complete/WalkCompletePage';

export default async function Page({ params }: { params: Promise<{ walkId: string }> }) {
  const { walkId } = await params;
  return <WalkCompletePage walkId={walkId} />;
}
