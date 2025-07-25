import News from '../components/ui/News';
import RecentWins from '../components/ui/RecentWins';

export default function Home() {
  return (
    <div className="min-h-screen p-6">
      <News />
      <RecentWins />
      
      {/* Заголовок "Кейсы" */}
      <h2 className="text-white text-center font-unbounded text-2xl font-medium mt-6">
        Кейсы
      </h2>
    </div>
  );
}
