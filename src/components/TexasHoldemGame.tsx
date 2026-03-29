'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

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
  totalBetInRound: number; // Összesen mennyit tett ebben a licitkörben
  folded: boolean;
  allIn: boolean;
}

type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export default function TexasHoldemGame() {
  // Game state
  const [deck, setDeck] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [player, setPlayer] = useState<Player>({ name: 'Játékos', chips: 500, hand: [], bet: 0, totalBetInRound: 0, folded: false, allIn: false });
  const [ai, setAi] = useState<Player>({ name: 'Gép', chips: 500, hand: [], bet: 0, totalBetInRound: 0, folded: false, allIn: false });
  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0); // Az aktuális legmagasabb tét
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [message, setMessage] = useState('Nyomj a Játék indítása gombra!');
  const [gameOver, setGameOver] = useState(false);
  const [dealer, setDealer] = useState<'player' | 'ai'>('player');
  const [betSliderValue, setBetSliderValue] = useState(20);
  const [blindLevel, setBlindLevel] = useState(1);
  const [timeUntilBlindIncrease, setTimeUntilBlindIncrease] = useState(120);
  const [playerTurn, setPlayerTurn] = useState(false);
  
  // Betting round state
  const [lastRaiser, setLastRaiser] = useState<'player' | 'ai' | null>(null);
  const [playerHasActed, setPlayerHasActed] = useState(false);
  const [aiHasActed, setAiHasActed] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [playerWonLastHand, setPlayerWonLastHand] = useState(false);
  
  const blindTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getBlinds = useCallback(() => {
    const smallBlind = 5 * blindLevel;
    const bigBlind = 10 * blindLevel;
    return { smallBlind, bigBlind };
  }, [blindLevel]);

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

  const evaluateHand = (hand: Card[], community: Card[]): number => {
    const allCards = [...hand, ...community];
    if (allCards.length < 5) return 0;
    
    const valueCount: Record<string, number> = {};
    const suitCount: Record<string, number> = {};
    
    allCards.forEach(card => {
      valueCount[card.value] = (valueCount[card.value] || 0) + 1;
      suitCount[card.suit] = (suitCount[card.suit] || 0) + 1;
    });

    const hasFlush = Object.values(suitCount).some(count => count >= 5);
    const counts = Object.values(valueCount).sort((a, b) => b - a);
    
    if (counts[0] === 4) return 700;
    if (counts[0] === 3 && counts[1] >= 2) return 600;
    if (hasFlush) return 500;
    if (counts[0] === 3) return 300;
    if (counts[0] === 2 && counts[1] === 2) return 200;
    if (counts[0] === 2) return 100;
    return 0;
  };

  const getHandName = (strength: number): string => {
    if (strength >= 700) return '(Póker)';
    if (strength >= 600) return '(Full)';
    if (strength >= 500) return '(Flöss)';
    if (strength >= 300) return '(Drill)';
    if (strength >= 200) return '(Két pár)';
    if (strength >= 100) return '(Pár)';
    return '(Magas lap)';
  };

  // Blind timer
  useEffect(() => {
    if (gameOver && phase === 'waiting' && player.chips > 0 && ai.chips > 0) {
      blindTimerRef.current = setInterval(() => {
        setTimeUntilBlindIncrease(prev => {
          if (prev <= 1) {
            setBlindLevel(l => l + 1);
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (blindTimerRef.current) clearInterval(blindTimerRef.current);
    };
  }, [gameOver, phase, player.chips, ai.chips]);

  // Reset timer when hand starts
  useEffect(() => {
    if (phase !== 'waiting') {
      setTimeUntilBlindIncrease(120);
      if (blindTimerRef.current) clearInterval(blindTimerRef.current);
    }
  }, [phase]);

  // Start new hand
  const startNewGame = useCallback(() => {
    if (player.chips <= 0) {
      setMessage('❌ Játék vége! A gép nyert!');
      setGameOver(true);
      return;
    }
    if (ai.chips <= 0) {
      setMessage('🎉 Gratulálok! Nyertél!');
      setGameOver(true);
      return;
    }

    const newDeck = createDeck();
    const playerHand = [newDeck.pop()!, newDeck.pop()!];
    const aiHand = [newDeck.pop()!, newDeck.pop()!];
    
    setDeck(newDeck);
    setPlayer({ ...player, hand: playerHand, bet: 0, totalBetInRound: 0, folded: false, allIn: false });
    setAi({ ...ai, hand: aiHand, bet: 0, totalBetInRound: 0, folded: false, allIn: false });
    setCommunityCards([]); // Clear all community cards
    setPot(0);
    setCurrentBet(0);
    setPhase('preflop');
    setGameOver(false);
    setLastRaiser(null);
    setPlayerHasActed(false);
    setAiHasActed(false);
    
    const { smallBlind, bigBlind } = getBlinds();
    
    // Post blinds
    if (dealer === 'player') {
      // Player = SB, AI = BB
      const playerSB = Math.min(smallBlind, player.chips);
      const aiBB = Math.min(bigBlind, ai.chips);
      
      setPlayer(p => ({ 
        ...p, 
        bet: playerSB, 
        totalBetInRound: playerSB,
        chips: p.chips - playerSB 
      }));
      setAi(a => ({ 
        ...a, 
        bet: aiBB, 
        totalBetInRound: aiBB,
        chips: a.chips - aiBB 
      }));
      setCurrentBet(bigBlind);
      setPot(playerSB + aiBB);
      setMessage(`Új leosztás - Preflop - Kisvak: ${smallBlind} | Nagyvak: ${bigBlind} - Tegyen tétet!`);
      setPlayerTurn(true);
      setLastRaiser('ai'); // BB is the initial "raiser"
    } else {
      // AI = SB, Player = BB
      const aiSB = Math.min(smallBlind, ai.chips);
      const playerBB = Math.min(bigBlind, player.chips);
      
      setAi(a => ({ 
        ...a, 
        bet: aiSB, 
        totalBetInRound: aiSB,
        chips: a.chips - aiSB 
      }));
      setPlayer(p => ({ 
        ...p, 
        bet: playerBB, 
        totalBetInRound: playerBB,
        chips: p.chips - playerBB 
      }));
      setCurrentBet(bigBlind);
      setPot(aiSB + playerBB);
      setMessage(`Új leosztás - Preflop - Kisvak: ${smallBlind} | Nagyvak: ${bigBlind} - A gép következik`);
      setPlayerTurn(false);
      setLastRaiser('player');
      
      // AI (SB) completes to BB
      setTimeout(() => {
        const toCall = bigBlind - aiSB;
        if (toCall > 0 && ai.chips >= toCall) {
          setAi(a => ({ 
            ...a, 
            bet: bigBlind, 
            totalBetInRound: bigBlind,
            chips: a.chips - toCall 
          }));
          setPot(p => p + toCall);
          setMessage('A gép megadta. Te következel!');
          setPlayerTurn(true);
          setAiHasActed(true);
        } else {
          setMessage('A gép all-in! Te következel!');
          setPlayerTurn(true);
          setAiHasActed(true);
        }
      }, 1000);
    }
  }, [createDeck, player, ai, dealer, getBlinds]);

  // Deal community cards - CRITICAL FIX: Cumulative cards (not replace)
  const dealCommunityCards = useCallback((newPhase: GamePhase) => {
    const newDeck = [...deck];
    let newCards: Card[] = [];
    
    if (newPhase === 'flop') {
      // Deal exactly 3 cards for flop (total: 3)
      for (let i = 0; i < 3; i++) {
        if (newDeck.length > 0) newCards.push(newDeck.pop()!);
      }
      console.log('Dealing FLOP (3 cards):', newCards.map(c => c.value + c.suit));
      setDeck(newDeck);
      setCommunityCards(newCards); // First 3 cards
    } else if (newPhase === 'turn') {
      // Deal exactly 1 card for turn (total: 4)
      if (newDeck.length > 0) newCards = [newDeck.pop()!];
      console.log('Dealing TURN (1 card):', newCards[0].value + newCards[0].suit);
      console.log('Community cards before turn:', communityCards.length);
      setDeck(newDeck);
      setCommunityCards([...communityCards, ...newCards]); // Add 1 card to existing 3 = 4 total
      console.log('Community cards after turn:', communityCards.length + 1);
    } else if (newPhase === 'river') {
      // Deal exactly 1 card for river (total: 5)
      if (newDeck.length > 0) newCards = [newDeck.pop()!];
      console.log('Dealing RIVER (1 card):', newCards[0].value + newCards[0].suit);
      console.log('Community cards before river:', communityCards.length);
      setDeck(newDeck);
      setCommunityCards([...communityCards, ...newCards]); // Add 1 card to existing 4 = 5 total
      console.log('Community cards after river:', communityCards.length + 1);
    }
  }, [deck, communityCards]);

  // Move to next phase
  const nextPhase = useCallback(() => {
    console.log('Moving to next phase from:', phase);
    
    // Reset betting for new street
    setPlayer(p => ({ ...p, bet: 0, totalBetInRound: 0 }));
    setAi(a => ({ ...a, bet: 0, totalBetInRound: 0 }));
    setCurrentBet(0);
    setLastRaiser(null);
    setPlayerHasActed(false);
    setAiHasActed(false);
    
    if (phase === 'preflop') {
      dealCommunityCards('flop');
      setPhase('flop');
      setMessage('Flop - 3 közös lap kiosztva. BB következik!');
      if (dealer === 'player') {
        setPlayerTurn(false);
        setTimeout(() => aiAction(true), 800);
      } else {
        setPlayerTurn(true);
        setMessage('Flop - Te következel!');
      }
    } else if (phase === 'flop') {
      dealCommunityCards('turn');
      setPhase('turn');
      setMessage('Turn - 4. közös lap kiosztva. BB következik!');
      if (dealer === 'player') {
        setPlayerTurn(false);
        setTimeout(() => aiAction(true), 800);
      } else {
        setPlayerTurn(true);
        setMessage('Turn - Te következel!');
      }
    } else if (phase === 'turn') {
      dealCommunityCards('river');
      setPhase('river');
      setMessage('River - 5. közös lap kiosztva. BB következik!');
      if (dealer === 'player') {
        setPlayerTurn(false);
        setTimeout(() => aiAction(true), 800);
      } else {
        setPlayerTurn(true);
        setMessage('River - Te következel!');
      }
    } else if (phase === 'river') {
      setPhase('showdown');
      const playerStrength = evaluateHand(player.hand, [...communityCards]);
      const aiStrength = evaluateHand(ai.hand, [...communityCards]);
      
      console.log('SHOWDOWN - Player:', playerStrength, 'AI:', aiStrength);
      console.log('Player hand:', player.hand);
      console.log('AI hand:', ai.hand);
      console.log('Community:', communityCards);
      
      if (playerStrength > aiStrength) {
        setMessage(`🎉 Nyertél! ${getHandName(playerStrength)}`);
        setPlayer(p => ({ ...p, chips: p.chips + pot }));
        setPlayerWonLastHand(true);
      } else if (aiStrength > playerStrength) {
        setMessage(`❌ A gép nyert! ${getHandName(aiStrength)}`);
        setAi(a => ({ ...a, chips: a.chips + pot }));
        setPlayerWonLastHand(false);
      } else {
        setMessage('🤝 Döntetlen! A pot feleződik.');
        const halfPot = Math.floor(pot / 2);
        setPlayer(p => ({ ...p, chips: p.chips + halfPot }));
        setAi(a => ({ ...a, chips: a.chips + halfPot }));
        setPlayerWonLastHand(false);
      }
      setGameOver(true);
      setPhase('waiting');
      setDealer(d => d === 'player' ? 'ai' : 'player');
    }
  }, [phase, dealCommunityCards, player, ai, communityCards, pot, dealer]);

  // AI Action - FIXED: AI cannot check when facing a bet
  const aiAction = useCallback((isFirstToAct: boolean = false) => {
    if (ai.folded || ai.allIn || phase === 'showdown' || phase === 'waiting') return;
    
    const handStrength = evaluateHand(ai.hand, communityCards);
    const toCall = currentBet - ai.bet; // How much to call
    const random = Math.random();
    const { bigBlind } = getBlinds();
    
    console.log('AI Action - toCall:', toCall, 'currentBet:', currentBet, 'ai.bet:', ai.bet, 'isFirstToAct:', isFirstToAct);
    
    setTimeout(() => {
      // CRITICAL: Check if AI is facing a bet
      if (toCall > 0) {
        // AI MUST call, raise, or fold - CANNOT CHECK!
        console.log('AI faces a bet of', toCall, '- cannot check!');
        
        if (ai.chips <= toCall) {
          // AI is all-in
          const allInAmount = ai.chips;
          setAi(a => ({ 
            ...a, 
            bet: a.bet + allInAmount, 
            totalBetInRound: a.totalBetInRound + allInAmount,
            chips: 0, 
            allIn: true 
          }));
          setPot(p => p + allInAmount);
          setMessage('A gép ALL-IN!');
          setAiHasActed(true);
          setPlayerTurn(true);
          return;
        }
        
        const shouldRaise = handStrength >= 100 || (random > 0.7 && handStrength >= 50);
        
        if (shouldRaise && ai.chips > toCall + bigBlind * 2) {
          // RAISE
          const raiseAmount = bigBlind * 2;
          const totalBet = currentBet + raiseAmount;
          const toAdd = totalBet - ai.bet;
          setAi(a => ({ 
            ...a, 
            bet: totalBet, 
            totalBetInRound: a.totalBetInRound + toAdd,
            chips: a.chips - toAdd 
          }));
          setCurrentBet(totalBet);
          setPot(p => p + toAdd);
          setMessage(`A gép emelt ${raiseAmount}-t`);
          setLastRaiser('ai');
          setAiHasActed(true);
          setPlayerHasActed(false);
          setPlayerTurn(true);
        } else if (random > 0.15 || toCall <= bigBlind) {
          // CALL
          setAi(a => ({ 
            ...a, 
            bet: currentBet, 
            totalBetInRound: a.totalBetInRound + toCall,
            chips: a.chips - toCall 
          }));
          setPot(p => p + toCall);
          setMessage('A gép megadta');
          setAiHasActed(true);
          
          if (playerHasActed || lastRaiser === 'ai') {
            setTimeout(() => nextPhase(), 800);
          } else {
            setPlayerTurn(true);
          }
        } else {
          // FOLD
          setAi(a => ({ ...a, folded: true }));
          setMessage('A gép dobta! Nyertél!');
          setPlayer(p => ({ ...p, chips: p.chips + pot }));
          setGameOver(true);
          setPhase('waiting');
        }
      } else {
        // No bet facing (toCall === 0) - AI can check or bet
        console.log('AI can check or bet (toCall = 0)');
        
        if (isFirstToAct || (!playerHasActed && lastRaiser !== 'player')) {
          // AI is first to act or player checked
          if (handStrength >= 100 && ai.chips > bigBlind * 2) {
            // BET
            const betAmount = Math.min(bigBlind * 2, ai.chips);
            setAi(a => ({ 
              ...a, 
              bet: betAmount, 
              totalBetInRound: a.totalBetInRound + betAmount,
              chips: a.chips - betAmount 
            }));
            setCurrentBet(betAmount);
            setPot(p => p + betAmount);
            setMessage(`A gép tett ${betAmount}-t`);
            setLastRaiser('ai');
            setAiHasActed(true);
            setPlayerTurn(true);
          } else {
            // CHECK
            setMessage('A gép checkelt');
            setAiHasActed(true);
            if (playerHasActed) {
              setTimeout(() => nextPhase(), 800);
            } else {
              setPlayerTurn(true);
            }
          }
        } else {
          // Check behind (player already checked)
          setMessage('A gép checkelt');
          setAiHasActed(true);
          setTimeout(() => nextPhase(), 800);
        }
      }
    }, 800);
  }, [ai, communityCards, currentBet, pot, getBlinds, phase, playerHasActed, lastRaiser, nextPhase]);

  // Player actions
  const handleFold = () => {
    setPlayer(p => ({ ...p, folded: true }));
    setMessage('Dobtad! A gép nyert.');
    setAi(a => ({ ...a, chips: a.chips + pot }));
    setGameOver(true);
    setPhase('waiting');
  };

  const handleCheck = () => {
    // CRITICAL: Cannot check if facing a bet!
    if (currentBet > player.bet) {
      console.log('Player cannot check - facing a bet of', currentBet - player.bet);
      handleCall();
      return;
    }
    console.log('Player checks (no bet facing)');
    setMessage('Checkeltél');
    setPlayerHasActed(true);
    
    if (aiHasActed && lastRaiser !== 'ai') {
      setTimeout(() => nextPhase(), 800);
    } else if (lastRaiser === 'player' && aiHasActed) {
      setTimeout(() => nextPhase(), 800);
    } else {
      setPlayerTurn(false);
      setTimeout(() => aiAction(true), 800);
    }
  };

  const handleCall = () => {
    const toCall = currentBet - player.bet;
    console.log('Player call - toCall:', toCall, 'player.chips:', player.chips);
    
    if (toCall >= player.chips) {
      // All-in
      setPot(p => p + player.chips);
      setPlayer(p => ({ 
        ...p, 
        bet: p.bet + player.chips, 
        totalBetInRound: p.totalBetInRound + player.chips,
        chips: 0, 
        allIn: true 
      }));
      setMessage('All-in!');
      setPlayerHasActed(true);
      if (ai.allIn || ai.chips === 0) {
        setTimeout(() => nextPhase(), 800);
      } else {
        setPlayerTurn(false);
        setTimeout(() => aiAction(false), 800);
      }
    } else {
      setPot(p => p + toCall);
      setPlayer(p => ({ 
        ...p, 
        bet: currentBet, 
        totalBetInRound: p.totalBetInRound + toCall,
        chips: p.chips - toCall 
      }));
      setMessage('Megadtad');
      setPlayerHasActed(true);
      
      if (lastRaiser === 'ai') {
        setTimeout(() => nextPhase(), 800);
      } else if (aiHasActed) {
        setTimeout(() => nextPhase(), 800);
      } else {
        setPlayerTurn(false);
        setTimeout(() => aiAction(false), 800);
      }
    }
  };

  const handleBet = () => {
    const betAmount = betSliderValue;
    const totalBet = player.bet + betAmount;
    const toAdd = betAmount;
    
    console.log('Player bet - betAmount:', betAmount, 'toAdd:', toAdd, 'player.bet:', player.bet, 'currentBet:', currentBet);
    
    // Must first call any outstanding bet before raising
    if (currentBet > player.bet) {
      // Need to call first
      const toCall = currentBet - player.bet;
      if (toAdd < toCall) {
        console.log('Must call at least', toCall, 'before raising');
        setMessage(`Előbb meg kell adnod ${toCall}-t!`);
        return;
      }
    }
    
    if (toAdd >= player.chips) {
      // All-in
      setPot(p => p + player.chips);
      setPlayer(p => ({ 
        ...p, 
        bet: player.bet + player.chips, 
        totalBetInRound: p.totalBetInRound + player.chips,
        chips: 0, 
        allIn: true 
      }));
      setCurrentBet(player.bet + player.chips);
      setMessage('All-in!');
      setPlayerHasActed(true);
      setLastRaiser('player');
      if (ai.allIn || ai.chips === 0) {
        setTimeout(() => nextPhase(), 800);
      } else {
        setPlayerTurn(false);
        setTimeout(() => aiAction(false), 800);
      }
    } else {
      setPot(p => p + toAdd);
      setPlayer(p => ({ 
        ...p, 
        bet: totalBet, 
        totalBetInRound: p.totalBetInRound + toAdd,
        chips: p.chips - toAdd 
      }));
      setCurrentBet(totalBet);
      setMessage(`Emeltél ${betAmount}-t`);
      setPlayerHasActed(true);
      setLastRaiser('player');
      setPlayerTurn(false);
      setTimeout(() => aiAction(false), 800);
    }
  };

  const handleAllIn = () => {
    const allInAmount = player.chips;
    setPot(p => p + allInAmount);
    setPlayer(p => ({ 
      ...p, 
      bet: p.bet + allInAmount, 
      totalBetInRound: p.totalBetInRound + allInAmount,
      chips: 0, 
      allIn: true 
    }));
    setCurrentBet(player.bet + allInAmount);
    setMessage(`All-in! (${allInAmount} chip)`);
    setPlayerHasActed(true);
    setLastRaiser('player');
    if (ai.allIn || ai.chips === 0) {
      setTimeout(() => nextPhase(), 800);
    } else {
      setPlayerTurn(false);
      setTimeout(() => aiAction(false), 800);
    }
  };

  const CardComponent = ({ card, hidden = false }: { card: Card; hidden?: boolean }) => (
    <div className={`w-10 h-14 md:w-14 md:h-20 bg-white rounded-lg shadow-lg border-2 border-gray-300 flex flex-col items-center justify-center ${hidden ? 'bg-gradient-to-br from-blue-600 to-blue-800' : ''}`}>
      {hidden ? (
        <div className="text-white text-xl">🂠</div>
      ) : (
        <>
          <span className={`text-sm md:text-lg font-bold ${card.color}`}>{card.value}</span>
          <span className={`text-lg md:text-xl ${card.color}`}>{card.suit}</span>
        </>
      )}
    </div>
  );

  const { smallBlind, bigBlind } = getBlinds();
  const toCall = currentBet - player.bet;
  const canCheck = toCall === 0;
  const maxBet = player.chips;

  return (
    <section className="py-12 bg-gradient-to-b from-green-900 to-green-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          🃏 Texas Hold'em Játék
        </h2>

        {gameOver && phase === 'waiting' && player.chips > 0 && ai.chips > 0 && (
          <div className="max-w-4xl mx-auto mb-4">
            <div className="bg-yellow-600/90 backdrop-blur-sm rounded-xl p-3 text-center border-2 border-yellow-400">
              <div className="flex justify-between items-center text-white flex-wrap gap-2">
                <span className="font-bold">📊 Vak szint: {blindLevel}</span>
                <span className="font-bold">🕐 Köv. emelés: {timeUntilBlindIncrease}s</span>
                <span className="font-bold">💰 Vakok: {smallBlind}/{bigBlind}</span>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto bg-green-700 rounded-3xl shadow-2xl p-4 md:p-6 border-8 border-yellow-900">
          {/* AI */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg relative">
                🤖
                {dealer === 'player' ? (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">BB</span>
                ) : (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">SB</span>
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-sm md:text-base">Gép</p>
                <p className="text-yellow-400 font-bold text-sm md:text-base">{ai.chips} chip</p>
              </div>
            </div>
            <div className="flex gap-1 md:gap-2">
              {ai.hand.map((card, i) => (
                <CardComponent key={i} card={card} hidden={!gameOver && phase !== 'showdown'} />
              ))}
            </div>
          </div>

          {/* Community Cards & Pot */}
          <div className="bg-green-800 rounded-2xl p-3 md:p-4 mb-4 border-4 border-yellow-800">
            <div className="text-center mb-3">
              <p className="text-yellow-400 text-lg md:text-xl font-bold">🏆 Pot: {pot} chip</p>
              <p className="text-white text-xs md:text-sm font-medium">{message}</p>
              {playerTurn && !gameOver && phase !== 'waiting' && (
                <p className="text-green-400 text-xs md:text-sm animate-pulse mt-1">👉 Te következel!</p>
              )}
            </div>
            
            <div className="flex justify-center gap-1 md:gap-2 flex-wrap min-h-[60px] md:min-h-[80px] items-center">
              {communityCards.map((card, i) => (
                <CardComponent key={i} card={card} />
              ))}
              {communityCards.length === 0 && phase === 'waiting' && (
                <p className="text-white/50 text-xs md:text-sm">Közös lapok</p>
              )}
            </div>

            {/* Phase indicators */}
            <div className="flex justify-center gap-1 md:gap-2 mt-3 flex-wrap">
              {['Preflop', 'Flop', 'Turn', 'River'].map((p, i) => {
                const phases: GamePhase[] = ['preflop', 'flop', 'turn', 'river'];
                const isActive = phase === phases[i];
                return (
                  <div
                    key={p}
                    className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                      isActive ? 'bg-yellow-500 text-white' : 'bg-gray-600 text-gray-400'
                    }`}
                  >
                    {p}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Player */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-poker-primary to-poker-secondary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white relative">
                PP
                {dealer === 'player' ? (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">SB</span>
                ) : (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">BB</span>
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-sm md:text-base">Te</p>
                <p className="text-yellow-400 font-bold text-sm md:text-base">{player.chips} chip</p>
              </div>
            </div>
            <div className="flex gap-1 md:gap-2">
              {player.hand.map((card, i) => (
                <CardComponent key={i} card={card} />
              ))}
              {player.hand.length === 0 && (
                <p className="text-white/50 text-xs md:text-sm">Nincsen lapjaid</p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4">
            {phase === 'waiting' ? (
              <div className="space-y-3">
                {gameOver ? (
                  <>
                    {/* Tournament Promotion - Show when player wins */}
                    {playerWonLastHand && (
                      <a
                        href="https://www.palace-poker.hu/tournaments"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all animate-pulse"
                      >
                        🏆 Élőben még jobb! Nézd meg versenyeinket!
                        <span className="block text-sm font-normal mt-1 opacity-90">👉 palace-poker.hu/tournaments</span>
                      </a>
                    )}
                    <div className="w-full py-4 bg-gray-600/50 text-white font-bold text-center rounded-xl text-lg">
                      ⏳ Következő leosztás {player.chips > 0 && ai.chips > 0 ? `${timeUntilBlindIncrease}s múlva` : '...'}
                    </div>
                    {player.chips > 0 && ai.chips > 0 && (
                      <button
                        onClick={startNewGame}
                        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg md:text-xl rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
                      >
                        🎮 Következő leosztás most
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={startNewGame}
                    className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg md:text-xl rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    🎮 Játék indítása
                  </button>
                )}
              </div>
            ) : !playerTurn ? (
              <div className="w-full py-4 bg-gray-600/50 text-white font-bold text-center rounded-xl">
                ⏳ A gép gondolkozik...
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <label className="text-white text-sm font-semibold block mb-2">
                    Tét mérete: <span className="text-yellow-400">{betSliderValue} chip</span>
                  </label>
                  <input
                    type="range"
                    min={bigBlind}
                    max={maxBet}
                    step={5}
                    value={betSliderValue}
                    onChange={(e) => setBetSliderValue(Number(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    disabled={!playerTurn}
                  />
                  <div className="flex justify-between text-xs text-white/70 mt-1">
                    <span>{bigBlind}</span>
                    <span>{maxBet}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={handleFold}
                    className="py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors text-sm md:text-base"
                  >
                    ❌ Dobás
                  </button>
                  <button
                    onClick={canCheck ? handleCheck : handleCall}
                    className="py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition-colors text-sm md:text-base"
                    disabled={!canCheck && toCall > player.chips}
                  >
                    {canCheck 
                      ? '✓ Check' 
                      : toCall >= player.chips 
                        ? '🔥 All-In' 
                        : `↔ Megadás (${toCall})`}
                  </button>
                  <button
                    onClick={handleBet}
                    className="py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
                    disabled={toCall > 0}
                  >
                    ⬆️ Emelés
                  </button>
                  <button
                    onClick={handleAllIn}
                    className="py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base"
                  >
                    🔥 ALL-IN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold text-base md:text-lg">📜 Játékszabályok</h3>
            <button
              onClick={() => setShowRules(!showRules)}
              className="text-white hover:text-yellow-400 transition-colors"
              title="Játékszabályok mutatása/elrejtése"
            >
              {showRules ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
          </div>
          {showRules && (
            <ul className="text-white/80 text-xs md:text-sm space-y-1">
              <li>• Mindkét játékos <strong>500 chippel</strong> indul</li>
              <li>• <strong>2 titkos lap</strong> + <strong>5 közös lap</strong> (max)</li>
              <li>• <strong>Flop:</strong> 3 lap | <strong>Turn:</strong> 4 lap | <strong>River:</strong> 5 lap</li>
              <li>• Ha emelsz, a gépnek meg kell adnia, emelnie vagy dobnia</li>
              <li>• Döntetlen esetén a pot <strong>feleződik</strong></li>
              <li>• Vakok 2 percenként emelkednek (kéz között)</li>
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
