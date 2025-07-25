import News from '../components/ui/News';
import RecentWins from '../components/ui/RecentWins';

export default function Home() {
  return (
    <div className="min-h-screen p-6">
      <News />
      <RecentWins />
    </div>
  );
}
