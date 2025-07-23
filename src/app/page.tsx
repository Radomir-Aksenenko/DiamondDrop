import News from '../components/ui/News';
import RecentWins from '../components/ui/RecentWins';
import RarityShowcase from '../components/ui/RarityShowcase';

export default function Home() {
  return (
    <div className="min-h-screen p-6">
      <News />
      <RecentWins />
      <RarityShowcase />
    </div>
  );
}
