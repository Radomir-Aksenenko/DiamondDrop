import News from '../components/ui/News';
import RecentWins from '../components/ui/RecentWins';

export default function Home() {
  return (
    <div className="min-h-screen p-6">
      <News />
      <RecentWins />
      
      {/* Заголовок "Кейсы" */}
      <h2 
        style={{
          color: '#FFFFFF',
          textAlign: 'center',
          fontFamily: 'Unbounded',
          fontSize: '24px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: 'normal',
          marginTop: '24px'
        }}
      >
        Кейсы
      </h2>
    </div>
  );
}
