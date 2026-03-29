'use client';

import { useState, useCallback } from 'react';

// Card suits and values
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

interface Card {
  suit: string;
  value: string;
  color: string;
}

interface Player {
  name: string;
  chips: number;
  hand: Card[];
  bet: number;
  folded: boolean;
}

type GamePhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export default function TexasHoldemGame() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [player, setPlayer] = useState<Player>({ name: 'Játékos', chips: 500, hand: [], bet: 0, folded: false });
  const [ai, setAi] = useState<Player>({ name: 'Gép', chips: 500, hand: [], bet: 0, folded: false });
  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('preflop');
  const [message, setMessage] = useState('Új játék indítása...');
  const [gameOver, setGameOver] = useState(false);
  const [dealer, setDealer] = useState<'player' | 'ai'>('player');

  // Create and shuffle deck
  const createDeck = useCallback((): Card[] => {
    const newDeck: Card[] = [];
    for (const suit of SUITS) {
      for (const value of VALUES) {
        newDeck.push({
          suit,
          value,
          color: suit === '♥' || suit === '♦' ? 'text-red-600' : 'text-gray-900',
        });
      }
    }
    // Fisher-Yates shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  }, []);

  // Evaluate hand strength (simplified)
  const evaluateHand = (hand: Card[], community: Card[]): number => {
    const allCards = [...hand, ...community];
    if (allCards.length < 5) return 0;
    
    // Count values and suits
    const valueCount: Record<string, number> = {};
    const suitCount: Record<string, number> = {};
    
    allCards.forEach(card => {
      valueCount[card.value] = (valueCount[card.value] || 0) + 1;
      suitCount[card.suit] = (suitCount[card.suit] || 0) + 1;
    });

    // Check for flush
    const hasFlush = Object.values(suitCount).some(count => count >= 5);
    
    // Check for pairs, three of a kind, etc.
    const counts = Object.values(valueCount).sort((a, b) => b - a);
    
    if (counts[0] === 4) return 700; // Four of a kind
    if (counts[0] === 3 && counts[1] >= 2) return 600; // Full house
    if (hasFlush) return 500; // Flush
    if (counts[0] === 3) return 300; // Three of a kind
    if (counts[0] === 2 && counts[1] === 2) return 200; // Two pair
    if (counts[0] === 2) return 100; // Pair
    return 0; // High card
  };

  // Start new game
  const startNewGame = useCallback(() => {
    if (player.chips <= 0 || ai.chips <= 0) {
      setMessage(player.chips <= 0 ? '❌ Játék vége! A gép nyert!' : '🎉 Gratulálok! Nyertél!');
      setGameOver(true);
      return;
    }

    const newDeck = createDeck();
    const playerHand = [newDeck.pop()!, newDeck.pop()!];
    const aiHand = [newDeck.pop()!, newDeck.pop()!];
    
    setDeck(newDeck);
    setPlayer({ ...player, hand: playerHand, bet: 0, folded: false });
    setAi({ ...ai, hand: aiHand, bet: 0, folded: false });
    setCommunityCards([]);
    setPot(0);
    setCurrentBet(0);
    setPhase('preflop');
    setMessage('Tedd meg a tétet!');
    setGameOver(false);
    
    // Blinds
    const smallBlind = 5;
    const bigBlind = 10;
    
    if (dealer === 'player') {
      setPlayer(p => ({ ...p, bet: smallBlind, chips: p.chips - smallBlind }));
      setAi(a => ({ ...a, bet: bigBlind, chips: a.chips - bigBlind }));
      setCurrentBet(bigBlind);
      setPot(smallBlind + bigBlind);
    } else {
      setAi(a => ({ ...a, bet: smallBlind, chips: a.chips - smallBlind }));
      setPlayer(p => ({ ...p, bet: bigBlind, chips: p.chips - bigBlind }));
      setCurrentBet(bigBlind);
      setPot(smallBlind + bigBlind);
    }
  }, [createDeck, player, ai, dealer]);

  // Deal community cards
  const dealCommunityCards = useCallback((count: number) => {
    const newDeck = [...deck];
    const newCards: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (newDeck.length > 0) {
        newCards.push(newDeck.pop()!);
      }
    }
    setDeck(newDeck);
    setCommunityCards(prev => [...prev, ...newCards]);
  }, [deck]);

  // AI Action
  const aiAction = useCallback(() => {
    if (ai.folded || ai.chips <= 0) return;
    
    const handStrength = evaluateHand(ai.hand, communityCards);
    const toCall = currentBet - ai.bet;
    const random = Math.random();
    
    setTimeout(() => {
      // Simple AI logic
      if (handStrength >= 100 || random > 0.7) {
        // Call or raise
        if (toCall > 0) {
          setAi(a => ({ ...a, bet: currentBet, chips: a.chips - toCall }));
          setPot(p => p + toCall);
          setMessage('Gép megadta');
        } else {
          const raiseAmount = Math.min(50, ai.chips);
          if (raiseAmount > 0 && random > 0.8) {
            setAi(a => ({ ...a, bet: a.bet + raiseAmount, chips: a.chips - raiseAmount }));
            setCurrentBet(cb => cb + raiseAmount);
            setPot(p => p + raiseAmount);
            setMessage('Gép emelt');
          } else {
            setMessage('Gép checkelt');
          }
        }
        nextPhase();
      } else if (toCall <= 10 || random > 0.9) {
        // Call small bets or bluff
        setAi(a => ({ ...a, bet: currentBet, chips: a.chips - toCall }));
        setPot(p => p + toCall);
        setMessage('Gép megadta');
        nextPhase();
      } else {
        // Fold
        setAi(a => ({ ...a, folded: true }));
        setMessage('Gép dobta! Nyertél!');
        setPlayer(p => ({ ...p, chips: p.chips + pot }));
        setGameOver(true);
      }
    }, 1000);
  }, [ai, communityCards, currentBet, pot]);

  // Next phase
  const nextPhase = useCallback(() => {
    setPlayer(p => ({ ...p, bet: 0 }));
    setAi(a => ({ ...a, bet: 0 }));
    setCurrentBet(0);
    
    setTimeout(() => {
      if (phase === 'preflop') {
        dealCommunityCards(3); // Flop
        setPhase('flop');
        setMessage('Flop');
      } else if (phase === 'flop') {
        dealCommunityCards(1); // Turn
        setPhase('turn');
        setMessage('Turn');
      } else if (phase === 'turn') {
        dealCommunityCards(1); // River
        setPhase('river');
        setMessage('River');
      } else if (phase === 'river') {
        // Showdown
        setPhase('showdown');
        const playerStrength = evaluateHand(player.hand, communityCards);
        const aiStrength = evaluateHand(ai.hand, communityCards);
        
        if (playerStrength > aiStrength) {
          setMessage(`🎉 Nyertél! (${getHandName(playerStrength)})`);
          setPlayer(p => ({ ...p, chips: p.chips + pot }));
        } else if (aiStrength > playerStrength) {
          setMessage(`❌ A gép nyert! (${getHandName(aiStrength)})`);
          setAi(a => ({ ...a, chips: a.chips + pot }));
        } else {
          setMessage('Döntetlen!');
          setPlayer(p => ({ ...p, chips: p.chips + Math.floor(pot / 2) }));
          setAi(a => ({ ...a, chips: a.chips + Math.floor(pot / 2) }));
        }
        setGameOver(true);
      }
    }, 500);
  }, [phase, dealCommunityCards, player, ai, communityCards, pot]);

  const getHandName = (strength: number): string => {
    if (strength >= 700) return 'Póker';
    if (strength >= 600) return 'Full';
    if (strength >= 500) return 'Flöss';
    if (strength >= 300) return 'Drill';
    if (strength >= 200) return 'Két pár';
    if (strength >= 100) return 'Pár';
    return 'Magas lap';
  };

  // Player actions
  const handleFold = () => {
    setPlayer(p => ({ ...p, folded: true }));
    setMessage('Dobtad! A gép nyert.');
    setAi(a => ({ ...a, chips: a.chips + pot }));
    setGameOver(true);
  };

  const handleCheck = () => {
    if (currentBet > player.bet) {
      handleCall();
      return;
    }
    setMessage('Checkeltél');
    aiAction();
  };

  const handleCall = () => {
    const toCall = currentBet - player.bet;
    if (toCall > player.chips) {
      // All-in
      setPot(p => p + player.chips);
      setPlayer(p => ({ ...p, bet: p.bet + p.chips, chips: 0 }));
    } else {
      setPot(p => p + toCall);
      setPlayer(p => ({ ...p, bet: currentBet, chips: p.chips - toCall }));
    }
    setMessage('Megadtad');
    aiAction();
  };

  const handleRaise = (amount: number) => {
    const totalBet = currentBet + amount;
    const toAdd = totalBet - player.bet;
    
    if (toAdd > player.chips) {
      // All-in
      setPot(p => p + player.chips);
      setPlayer(p => ({ ...p, bet: p.bet + p.chips, chips: 0 }));
      setCurrentBet(player.bet + player.chips);
    } else {
      setPot(p => p + toAdd);
      setPlayer(p => ({ ...p, bet: totalBet, chips: p.chips - toAdd }));
      setCurrentBet(totalBet);
    }
    setMessage(`Emeltél ${amount}-t`);
    aiAction();
  };

  // Card component
  const CardComponent = ({ card, hidden = false }: { card: Card; hidden?: boolean }) => (
    <div className={`w-12 h-16 md:w-16 md:h-24 bg-white rounded-lg shadow-lg border-2 border-gray-300 flex flex-col items-center justify-center ${hidden ? 'bg-gradient-to-br from-blue-600 to-blue-800' : ''}`}>
      {hidden ? (
        <div className="text-white text-2xl">🂠</div>
      ) : (
        <>
          <span className={`text-lg md:text-xl font-bold ${card.color}`}>{card.value}</span>
          <span className={`text-xl md:text-2xl ${card.color}`}>{card.suit}</span>
        </>
      )}
    </div>
  );

  return (
    <section className="py-12 bg-gradient-to-b from-green-900 to-green-800 relative overflow-hidden">
      {/* Felt texture */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
          🃏 Texas Hold'em Játék
        </h2>

        {/* Game Table */}
        <div className="max-w-4xl mx-auto bg-green-700 rounded-3xl shadow-2xl p-4 md:p-8 border-8 border-yellow-900">
          {/* AI Player */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                🤖
              </div>
              <div>
                <p className="text-white font-semibold">Gép</p>
                <p className="text-yellow-400 font-bold">{ai.chips} chip</p>
              </div>
            </div>
            <div className="flex gap-2">
              {ai.hand.map((card, i) => (
                <CardComponent key={i} card={card} hidden={!gameOver && phase !== 'showdown'} />
              ))}
            </div>
          </div>

          {/* Community Cards & Pot */}
          <div className="bg-green-800 rounded-2xl p-4 md:p-6 mb-6 border-4 border-yellow-800">
            <div className="text-center mb-4">
              <p className="text-yellow-400 text-lg font-bold">🏆 Pot: {pot} chip</p>
              <p className="text-white text-sm">{message}</p>
            </div>
            
            <div className="flex justify-center gap-2 md:gap-3 flex-wrap">
              {communityCards.map((card, i) => (
                <CardComponent key={i} card={card} />
              ))}
              {communityCards.length === 0 && (
                <p className="text-white/50 text-sm">Közös lapok</p>
              )}
            </div>

            {/* Phase indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {['Preflop', 'Flop', 'Turn', 'River'].map((p, i) => (
                <div
                  key={p}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    (i === 0 && phase === 'preflop') ||
                    (i === 1 && phase === 'flop') ||
                    (i === 2 && phase === 'turn') ||
                    (i === 3 && phase === 'river')
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Human Player */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                👤
              </div>
              <div>
                <p className="text-white font-semibold">Te</p>
                <p className="text-yellow-400 font-bold">{player.chips} chip</p>
              </div>
            </div>
            <div className="flex gap-2">
              {player.hand.map((card, i) => (
                <CardComponent key={i} card={card} />
              ))}
              {player.hand.length === 0 && (
                <p className="text-white/50 text-sm">Nincsen lapjaid</p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6">
            {gameOver ? (
              <button
                onClick={startNewGame}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                🎮 Új játék
              </button>
            ) : player.hand.length === 0 ? (
              <button
                onClick={startNewGame}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                🎲 Játék indítása
              </button>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={handleFold}
                  className="py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                >
                  ❌ Dobás
                </button>
                <button
                  onClick={handleCheck}
                  className="py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  ✓ Check/Megadás
                </button>
                <button
                  onClick={() => handleRaise(25)}
                  className="py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                >
                  ⬆️ +25
                </button>
                <button
                  onClick={() => handleRaise(50)}
                  className="py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  ⬆️ +50
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rules */}
        <div className="max-w-2xl mx-auto mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-white font-bold text-lg mb-3">📜 Játékszabályok</h3>
          <ul className="text-white/80 text-sm space-y-2">
            <li>• Mindkét játékos 500 chippel indul</li>
            <li>• Kisvak: 5, Nagyvak: 10</li>
            <li>• A gép ellen játszol</li>
            <li>• A legjobb 5 lapos kombináció nyer</li>
            <li>• Sorrend: Magas lap → Pár → Két pár → Drill → Flöss → Full → Póker</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
