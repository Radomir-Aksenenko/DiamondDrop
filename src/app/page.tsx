import SPWActions from '@/components/ui/SPWActions';

export default function Home() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Diamond Drop</h1>
      
      {/* Демонстрация работы с SPWMini */}
      <div className="max-w-md mx-auto bg-[#19191D]/50 rounded-lg overflow-hidden shadow-lg">
        <SPWActions />
      </div>
    </div>
  );
}
