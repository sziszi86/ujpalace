import TournamentCalendar from '@/components/TournamentCalendar';

export default function TournamentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-poker-light to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Versenynaptár
          </h1>
          <p className="text-xl text-poker-muted max-w-3xl mx-auto">
            Minden versenyünk egy helyen. 
            Jelentkezz a következő élő poker versenyekre!
          </p>
        </div>
        
        <TournamentCalendar showCashGames={false} />
      </div>
    </div>
  );
}