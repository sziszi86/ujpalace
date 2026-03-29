'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';

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
  bet: number; // Current round bet
  folded: boolean;
  allIn: boolean;
}

type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export default function TexasHoldemGame() {
  // Game state
  const [deck, setDeck] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [player, setPlayer] = useState<Player>({ name: 'Játékos', chips: 500, hand: [], bet: 0, folded: false, allIn: false });
  const [ai, setAi] = useState<Player>({ name: 'Gép', chips: 500, hand: [], bet: 0, folded: false, allIn: false });
  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0); // Highest bet in current round
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [message, setMessage] = useState('Nyomj a Játék indítása gombra!');
  const [actionType, setActionType] = useState<'success' | 'danger' | 'warning' | 'info' | 'neutral'>('neutral');
  const [gameOver, setGameOver] = useState(false);
  const [dealer, setDealer] = useState<'player' | 'ai'>('player');
  const [betSliderValue, setBetSliderValue] = useState(20);
  const [blindLevel, setBlindLevel] = useState(1);
  const [timeUntilBlindIncrease, setTimeUntilBlindIncrease] = useState(120);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [playerWonLastHand, setPlayerWonLastHand] = useState(false);
  const [isStartingHand, setIsStartingHand] = useState(false);

  // Betting round state - SIMPLIFIED for proper poker
  const [bettingRoundComplete, setBettingRoundComplete] = useState(false);
  const [playerActed, setPlayerActed] = useState(false); // Has player acted in this round
  const [aiActed, setAiActed] = useState(false); // Has AI acted in this round
  const [lastRaiseAmount, setLastRaiseAmount] = useState(0); // Size of last raise for min-raise calculation

  // Avatar emotions
  type AIMood = 'neutral' | 'thinking' | 'confident' | 'nervous' | 'happy' | 'angry' | 'worried';
  const [aiMood, setAiMood] = useState<AIMood>('neutral');

  // Hand ID to prevent stale AI actions
  const handIdRef = useRef(0);

  // Prevent duplicate nextPhase calls
  const isTransitioningPhaseRef = useRef(false);

  const blindTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to set message with visual style
  const setActionMessage = useCallback((msg: string, type: 'success' | 'danger' | 'warning' | 'info' | 'neutral' = 'neutral') => {
    setMessage(msg);
    setActionType(type);
  }, []);

  const getBlinds = useCallback(() => {
    const smallBlind = 5 * blindLevel;
    const bigBlind = 10 * blindLevel;
    return { smallBlind, bigBlind };
  }, [blindLevel]);

  // Get AI avatar emoji and animation based on mood
  const getAIAvatar = useCallback(() => {
    const moodData = {
      neutral: { emoji: '🤖', color: 'from-gray-600 to-gray-700', animation: '' },
      thinking: { emoji: '🤔', color: 'from-blue-600 to-blue-700', animation: 'animate-pulse' },
      confident: { emoji: '😎', color: 'from-purple-600 to-purple-700', animation: 'animate-bounce-subtle' },
      nervous: { emoji: '😰', color: 'from-yellow-600 to-orange-600', animation: 'animate-shake' },
      happy: { emoji: '😄', color: 'from-green-600 to-emerald-600', animation: 'animate-bounce' },
      angry: { emoji: '😠', color: 'from-red-600 to-red-700', animation: 'animate-shake' },
      worried: { emoji: '😬', color: 'from-orange-600 to-orange-700', animation: 'animate-pulse' },
    };
    return moodData[aiMood];
  }, [aiMood]);

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

  // Check if betting round is complete - SIMPLIFIED SENIOR POKER LOGIC
  const checkBettingRoundComplete = useCallback(() => {
    if (phase === 'waiting' || phase === 'showdown') return false;
    if (bettingRoundComplete) return false; // Already complete

    // If one player folded, round is over
    if (player.folded || ai.folded) return true;

    // If both players are all-in, round is complete
    if (player.allIn && ai.allIn) return true;
    if (player.allIn && ai.bet >= player.bet) return true;
    if (ai.allIn && player.bet >= ai.bet) return true;

    // Both players must have bet the same amount
    if (player.bet !== ai.bet) return false;

    // Both players must have acted in this betting round
    if (!playerActed || !aiActed) return false;

    console.log('✅ Betting round complete!');
    return true;
  }, [phase, bettingRoundComplete, player.bet, ai.bet, player.folded, ai.folded, player.allIn, ai.allIn, playerActed, aiActed]);

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

  useEffect(() => {
    if (phase !== 'waiting') {
      setTimeUntilBlindIncrease(120);
      if (blindTimerRef.current) clearInterval(blindTimerRef.current);
    }
  }, [phase]);

  // Start new hand
  const startNewGame = useCallback(() => {
    // CRITICAL: Prevent multiple simultaneous calls
    if (isStartingHand) {
      console.log('⚠️ startNewGame blocked: already starting new game');
      return;
    }

    // CRITICAL: Don't start new hand if already in progress
    if (phase !== 'waiting') {
      console.log('⚠️ startNewGame blocked: hand already in progress', { phase });
      return;
    }

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

    // Set flag to prevent re-entry
    setIsStartingHand(true);

    // CRITICAL: Increment handId FIRST to invalidate any pending AI actions
    handIdRef.current += 1;
    const currentHandId = handIdRef.current;
    console.log('🎬 Starting new hand, handId:', currentHandId);

    const newDeck = createDeck();
    const playerHand = [newDeck.pop()!, newDeck.pop()!];
    const aiHand = [newDeck.pop()!, newDeck.pop()!];

    // CRITICAL: Use updater functions to ensure fresh state
    setDeck(newDeck);
    setPlayer(p => ({ ...p, hand: playerHand, bet: 0, folded: false, allIn: false }));
    setAi(a => ({ ...a, hand: aiHand, bet: 0, folded: false, allIn: false }));
    setCommunityCards([]);
    setPot(0);
    setCurrentBet(0);
    setPhase('preflop');
    setGameOver(false);
    setPlayerWonLastHand(false);
    setBettingRoundComplete(false);
    setPlayerActed(false);
    setAiActed(false);
    setLastRaiseAmount(0);
    setAiMood('neutral'); // Reset AI mood for new hand

    const { smallBlind, bigBlind } = getBlinds();

    // Post blinds
    if (dealer === 'player') {
      // Player = SB (dealer), AI = BB
      const playerSB = Math.min(smallBlind, player.chips);
      const aiBB = Math.min(bigBlind, ai.chips);

      setPlayer(p => ({ ...p, bet: playerSB, chips: p.chips - playerSB }));
      setAi(a => ({ ...a, bet: aiBB, chips: a.chips - aiBB }));
      setCurrentBet(bigBlind);
      setPot(playerSB + aiBB);
      setLastRaiseAmount(bigBlind - smallBlind);
      setMessage(`Új leosztás - Preflop | Vakok: ${smallBlind}/${bigBlind} - Te következel (SB)!`);
      setPlayerTurn(true);
      setPlayerActed(false);
      setAiActed(false);
    } else {
      // AI = SB (dealer), Player = BB
      const aiSB = Math.min(smallBlind, ai.chips);
      const playerBB = Math.min(bigBlind, player.chips);

      setAi(a => ({ ...a, bet: aiSB, chips: a.chips - aiSB }));
      setPlayer(p => ({ ...p, bet: playerBB, chips: p.chips - playerBB }));
      setCurrentBet(bigBlind);
      setPot(aiSB + playerBB);
      setLastRaiseAmount(bigBlind - smallBlind);
      setMessage(`Új leosztás - Preflop | Vakok: ${smallBlind}/${bigBlind} - A gép következik (SB)`);
      setPlayerTurn(false);
      setPlayerActed(false);
      setAiActed(false);

      // AI (SB) acts first preflop
      setTimeout(() => {
        console.log('🎲 Calling AI action from startNewGame, handId:', currentHandId);
        // Pass 'preflop' explicitly to avoid React state timing issues
        aiAction(true, undefined, undefined, currentHandId, 'preflop');
      }, 1000);
    }

    // Reset flag after state updates are done
    setTimeout(() => {
      setIsStartingHand(false);
    }, 100);
  }, [createDeck, player, ai, dealer, getBlinds, isStartingHand, phase]);

  // Deal community cards
  const dealCommunityCards = useCallback((newPhase: GamePhase) => {
    const newDeck = [...deck];
    let newCards: Card[] = [];
    
    if (newPhase === 'flop') {
      for (let i = 0; i < 3; i++) {
        if (newDeck.length > 0) newCards.push(newDeck.pop()!);
      }
      setDeck(newDeck);
      setCommunityCards(newCards);
    } else if (newPhase === 'turn') {
      if (newDeck.length > 0) newCards = [newDeck.pop()!];
      setDeck(newDeck);
      setCommunityCards([...communityCards, ...newCards]);
    } else if (newPhase === 'river') {
      if (newDeck.length > 0) newCards = [newDeck.pop()!];
      setDeck(newDeck);
      setCommunityCards([...communityCards, ...newCards]);
    }
  }, [deck, communityCards]);

  // Move to next phase - CRITICAL: Only called when betting round is complete
  const nextPhase = useCallback(() => {
    // CRITICAL: Prevent duplicate calls with ref
    if (isTransitioningPhaseRef.current) {
      console.log('⚠️ nextPhase blocked: already transitioning');
      return;
    }

    console.log('nextPhase called from:', phase);
    console.log('player.bet:', player.bet, 'ai.bet:', ai.bet);

    // Prevent infinite loop
    if (phase === 'waiting' || phase === 'showdown') return;

    // Set flag
    isTransitioningPhaseRef.current = true;
    
    // Reset betting for new street
    setPlayer(p => ({ ...p, bet: 0 }));
    setAi(a => ({ ...a, bet: 0 }));
    setCurrentBet(0);
    setBettingRoundComplete(false);
    setPlayerActed(false);
    setAiActed(false);
    setLastRaiseAmount(0);

    // Reset phase transition flag
    isTransitioningPhaseRef.current = false;
    
    if (phase === 'preflop') {
      dealCommunityCards('flop');
      setPhase('flop');
      // Postflop: BB (out of position) acts first
      if (dealer === 'player') {
        // Player is SB (button), AI is BB - AI acts first
        setPlayerTurn(false);
        setMessage('🃏 Flop - 3 közös lap! A gép (BB) következik');
        setTimeout(() => aiAction(true), 800);
      } else {
        // AI is SB (button), Player is BB - Player acts first
        setPlayerTurn(true);
        setMessage('🃏 Flop - 3 közös lap! Te (BB) következel');
      }
    } else if (phase === 'flop') {
      dealCommunityCards('turn');
      setPhase('turn');
      // Postflop: BB acts first
      if (dealer === 'player') {
        setPlayerTurn(false);
        setMessage('🃏 Turn - 4. közös lap! A gép (BB) következik');
        setTimeout(() => aiAction(true), 800);
      } else {
        setPlayerTurn(true);
        setMessage('🃏 Turn - 4. közös lap! Te (BB) következel');
      }
    } else if (phase === 'turn') {
      dealCommunityCards('river');
      setPhase('river');
      // Postflop: BB acts first
      if (dealer === 'player') {
        setPlayerTurn(false);
        setMessage('🃏 River - 5. közös lap! A gép (BB) következik');
        setTimeout(() => aiAction(true), 800);
      } else {
        setPlayerTurn(true);
        setMessage('🃏 River - 5. közös lap! Te (BB) következel');
      }
    } else if (phase === 'river') {
      setPhase('showdown');

      // CRITICAL: Capture pot value before any state changes
      const finalPot = pot;

      const playerStrength = evaluateHand(player.hand, [...communityCards]);
      const aiStrength = evaluateHand(ai.hand, [...communityCards]);

      if (playerStrength > aiStrength) {
        setAiMood('angry'); // Mérges mert vesztett
        setActionMessage(`🎉 NYERTÉL! ${getHandName(playerStrength)} - ${finalPot} chip!`, 'success');
        setPlayer(p => ({ ...p, chips: p.chips + finalPot }));
        setPlayerWonLastHand(true);
      } else if (aiStrength > playerStrength) {
        setAiMood('happy'); // Boldog mert nyert
        setActionMessage(`❌ A GÉP NYERT! ${getHandName(aiStrength)} - ${finalPot} chip`, 'danger');
        setAi(a => ({ ...a, chips: a.chips + finalPot }));
        setPlayerWonLastHand(false);
      } else {
        setAiMood('neutral'); // Döntetlen
        setActionMessage(`🤝 DÖNTETLEN! A pot feleződik (${Math.floor(finalPot / 2)} chip mindenkinek)`, 'info');
        const halfPot = Math.floor(finalPot / 2);
        setPlayer(p => ({ ...p, chips: p.chips + halfPot }));
        setAi(a => ({ ...a, chips: a.chips + halfPot }));
        setPlayerWonLastHand(false);
      }
      setGameOver(true);
      setPhase('waiting');
      setDealer(d => d === 'player' ? 'ai' : 'player');
    }
  }, [phase, dealCommunityCards, player, ai, communityCards, pot, dealer]);

  // Check if we should proceed to next phase
  useEffect(() => {
    if (bettingRoundComplete || phase === 'waiting' || phase === 'showdown') return;
    
    const shouldProceed = checkBettingRoundComplete();
    if (shouldProceed) {
      console.log('Proceeding to next phase...');
      setBettingRoundComplete(true);
      setTimeout(() => nextPhase(), 800);
    }
  }, [bettingRoundComplete, phase, checkBettingRoundComplete, nextPhase]);

  // AI Action - SENIOR POKER STRATEGY
  const aiAction = useCallback((
    isFirstToAct: boolean = false,
    overrideCurrentBet?: number,
    overridePot?: number,
    capturedHandId?: number,
    overridePhase?: GamePhase
  ) => {
    // CRITICAL: Check handId first to prevent stale actions from previous hands
    if (capturedHandId !== undefined && capturedHandId !== handIdRef.current) {
      console.log('⚠️ AI Action skipped: stale action from previous hand', { capturedHandId, currentHandId: handIdRef.current });
      return;
    }

    // CRITICAL: Only act during active betting phases
    // Use override phase if provided (to handle React state timing in startNewGame)
    const actualPhase = overridePhase ?? phase;
    const validPhases: GamePhase[] = ['preflop', 'flop', 'turn', 'river'];
    if (!validPhases.includes(actualPhase)) {
      console.log('⚠️ AI Action skipped: wrong phase', { actualPhase, phase });
      return;
    }

    // Debug: Log why AI might skip
    // CRITICAL: Skip folded/allIn check if this is from startNewGame (capturedHandId present)
    // because state hasn't updated yet from previous hand
    if (!capturedHandId && (ai.folded || ai.allIn)) {
      console.log('⚠️ AI Action skipped:', {
        folded: ai.folded,
        allIn: ai.allIn,
      });
      return;
    }

    // Don't check bettingRoundComplete on first action of new round
    if (bettingRoundComplete && !isFirstToAct) {
      console.log('⚠️ AI Action skipped: betting round already complete');
      return;
    }

    // Use override values if provided (to handle React state timing)
    const actualCurrentBet = overrideCurrentBet ?? currentBet;
    const actualPot = overridePot ?? pot;

    const handStrength = evaluateHand(ai.hand, communityCards);
    const toCall = actualCurrentBet - ai.bet;
    const random = Math.random();
    const { bigBlind } = getBlinds();
    const potOdds = toCall > 0 ? toCall / (actualPot + toCall) : 0;

    console.log('🤖 AI Action - currentBet:', actualCurrentBet, 'ai.bet:', ai.bet, 'toCall:', toCall, 'handStrength:', handStrength, 'isFirstToAct:', isFirstToAct);

    // Show thinking animation
    setAiMood('thinking');

    setTimeout(() => {
      // Mark AI as acted
      setAiActed(true);

      if (toCall > 0) {
        // ============ AI FACES A BET ============
        console.log('🤖 AI FACING BET - must call/raise/fold');

        // Check if bet is big (nervous)
        const { bigBlind } = getBlinds();
        if (toCall > bigBlind * 3) {
          setAiMood('nervous');
        }
        if (ai.chips <= toCall) {
          // All-in call
          const allInAmount = ai.chips;
          setAi(a => ({ ...a, bet: a.bet + allInAmount, chips: 0, allIn: true }));
          setPot(p => p + allInAmount);
          setActionMessage(`🔥 A GÉP ALL-IN! ${allInAmount} chip!`, 'warning');
          setPlayerTurn(true);
          return;
        }

        // Fold thresholds based on hand strength and pot odds
        const shouldFold = (handStrength < 50 && potOdds > 0.4) ||
                          (handStrength === 0 && toCall > bigBlind * 2) ||
                          (random > 0.85 && handStrength < 100);

        if (shouldFold) {
          // CRITICAL: Capture pot before state changes
          const finalPot = actualPot;

          setAiMood('angry'); // Mérges mert dob
          setAi(a => ({ ...a, folded: true }));
          setActionMessage(`✅ A GÉP DOBOTT! Nyertél ${finalPot} chipet!`, 'success');
          setPlayer(p => ({ ...p, chips: p.chips + finalPot }));
          setGameOver(true);
          setPhase('waiting');
          setDealer(d => d === 'player' ? 'ai' : 'player'); // Switch dealer for next hand
          return;
        }

        // Raise thresholds - aggressive with strong hands
        const shouldRaise = (handStrength >= 300) || // Trips or better - always raise
                           (handStrength >= 200 && random > 0.5) || // Two pair - 50% raise
                           (handStrength >= 100 && random > 0.7) || // Pair - 30% raise
                           (handStrength >= 50 && random > 0.9); // Weak hand bluff - 10%

        if (shouldRaise && ai.chips > toCall + bigBlind * 2) {
          // Calculate raise size based on hand strength
          let raiseMultiplier = 2;
          if (handStrength >= 500) raiseMultiplier = 3; // Flush+ - bigger raise
          if (handStrength >= 300) raiseMultiplier = 2.5; // Trips+

          const raiseAmount = Math.min(bigBlind * raiseMultiplier, lastRaiseAmount * 2, ai.chips - toCall);
          const totalBet = actualCurrentBet + raiseAmount;
          const toAdd = totalBet - ai.bet;

          setAiMood('confident'); // Magabiztos mert emel
          setAi(a => ({ ...a, bet: totalBet, chips: a.chips - toAdd }));
          setCurrentBet(totalBet);
          setPot(p => p + toAdd);
          setLastRaiseAmount(raiseAmount);
          setActionMessage(`⬆️ A GÉP EMELT! +${raiseAmount} chip (összesen: ${totalBet})`, 'warning');
          setPlayerActed(false); // Player must act again
          setPlayerTurn(true);
        } else {
          // CALL
          setAiMood(handStrength < 100 ? 'worried' : 'neutral'); // Aggódik ha gyenge kézzel call
          setAi(a => ({ ...a, bet: actualCurrentBet, chips: a.chips - toCall }));
          setPot(p => p + toCall);
          setActionMessage(`✓ A gép megadta (${toCall} chip)`, 'info');
          setPlayerTurn(true);
        }
      } else {
        // ============ NO BET FACING - AI CAN CHECK OR BET ============

        // Bet thresholds
        const shouldBet = (handStrength >= 300) || // Trips+ - always bet
                         (handStrength >= 200 && random > 0.4) || // Two pair - 60% bet
                         (handStrength >= 100 && random > 0.6) || // Pair - 40% bet
                         (handStrength >= 50 && random > 0.85); // Weak hand bluff - 15%

        if (shouldBet && ai.chips > bigBlind) {
          // Calculate bet size based on hand strength and position
          let betMultiplier = isFirstToAct ? 0.5 : 0.7; // Smaller when first to act
          if (handStrength >= 500) betMultiplier = 1; // Bigger with strong hands
          if (handStrength >= 300) betMultiplier = 0.75;

          const betAmount = Math.min(Math.floor(actualPot * betMultiplier + bigBlind), ai.chips);

          setAiMood(handStrength >= 200 ? 'confident' : 'neutral'); // Magabiztos ha jó kézzel bet
          setAi(a => ({ ...a, bet: betAmount, chips: a.chips - betAmount }));
          setCurrentBet(betAmount);
          setPot(p => p + betAmount);
          setLastRaiseAmount(betAmount);
          setActionMessage(`💰 A GÉP TETT: ${betAmount} chip`, 'warning');
          setPlayerActed(false); // Player must act
          setPlayerTurn(true);
        } else {
          // CHECK
          console.log('🤖 AI CHECK - no bet facing');
          setAiMood('neutral');
          setActionMessage('✓ A gép checkelt', 'info');
          setPlayerTurn(true);
        }
      }
    }, 800);
  }, [ai, communityCards, currentBet, pot, getBlinds, phase, bettingRoundComplete, lastRaiseAmount]);

  // Player actions - PROPER POKER LOGIC
  const handleFold = () => {
    // CRITICAL: Capture pot before state changes
    const finalPot = pot;

    setPlayer(p => ({ ...p, folded: true }));
    setPlayerActed(true);
    setActionMessage(`❌ DOBTÁL! A gép nyert ${finalPot} chipet`, 'danger');
    setAi(a => ({ ...a, chips: a.chips + finalPot }));
    setGameOver(true);
    setPhase('waiting');
    setDealer(d => d === 'player' ? 'ai' : 'player');
  };

  const handleCheck = () => {
    const toCall = currentBet - player.bet;
    if (toCall > 0) {
      setActionMessage('⚠️ Nem checkelhetsz - tét van az asztalon!', 'warning');
      return;
    }

    console.log('✓ Player checks');
    setActionMessage('✓ Checkeltél', 'info');
    setPlayerActed(true);
    setPlayerTurn(false);

    // If AI already acted, round is complete
    if (aiActed) {
      // Both checked - proceed to next phase
      setBettingRoundComplete(true);
      setTimeout(() => nextPhase(), 800);
    } else {
      // AI still needs to act
      setTimeout(() => aiAction(false), 800);
    }
  };

  const handleCall = () => {
    const toCall = currentBet - player.bet;
    console.log('✓ Player call - toCall:', toCall);

    if (toCall === 0) {
      handleCheck();
      return;
    }

    if (toCall >= player.chips) {
      // All-in call
      const allInAmount = player.chips;
      setPot(p => p + allInAmount);
      setPlayer(p => ({ ...p, bet: p.bet + allInAmount, chips: 0, allIn: true }));
      setMessage('🔥 ALL-IN!');
      setPlayerActed(true);
      setPlayerTurn(false);

      if (ai.allIn || ai.chips === 0) {
        setBettingRoundComplete(true);
        setTimeout(() => nextPhase(), 800);
      } else {
        setTimeout(() => aiAction(false), 800);
      }
    } else {
      setPot(p => p + toCall);
      setPlayer(p => ({ ...p, bet: currentBet, chips: p.chips - toCall }));
      setActionMessage(`✓ Megadtad (${toCall} chip)`, 'info');
      setPlayerActed(true);
      setPlayerTurn(false);

      // If AI already acted, round complete
      if (aiActed) {
        setBettingRoundComplete(true);
        setTimeout(() => nextPhase(), 800);
      } else {
        setTimeout(() => aiAction(false), 800);
      }
    }
  };

  const handleBetOrRaise = () => {
    const toCall = currentBet - player.bet;
    const { bigBlind } = getBlinds();

    // Calculate minimum raise
    const minRaise = currentBet > 0 ? Math.max(lastRaiseAmount, bigBlind) : bigBlind;
    const minTotalBet = currentBet + minRaise;

    let actualBet = betSliderValue;

    // If facing a bet, must call + raise
    if (toCall > 0) {
      const totalNeeded = toCall + minRaise;
      if (player.chips < totalNeeded) {
        // Can only call or all-in
        setMessage(`⚠️ Minimum emelés: ${minRaise}. All-in vagy megadás!`);
        return;
      }

      if (actualBet < totalNeeded) {
        actualBet = totalNeeded;
      }
    } else {
      // First bet/raise
      if (actualBet < minRaise) {
        actualBet = minRaise;
      }
    }

    const totalBet = player.bet + actualBet;
    const toAdd = actualBet;

    if (toAdd >= player.chips) {
      // All-in
      handleAllIn();
      return;
    }

    const raiseAmount = totalBet - currentBet;
    const newPot = pot + toAdd;

    setPot(newPot);
    setPlayer(p => ({ ...p, bet: totalBet, chips: p.chips - toAdd }));
    setCurrentBet(totalBet);
    setLastRaiseAmount(raiseAmount);
    setActionMessage(`⬆️ EMELTÉL! +${raiseAmount} chip (összesen: ${totalBet})`, 'warning');
    setPlayerActed(true);
    setAiActed(false); // AI must act again
    setPlayerTurn(false);

    // Pass the NEW bet and pot to AI so it sees the updated values
    setTimeout(() => aiAction(false, totalBet, newPot), 800);
  };

  const handleAllIn = () => {
    const allInAmount = player.chips;
    const newTotalBet = player.bet + allInAmount;
    const raiseAmount = newTotalBet - currentBet;
    const newPot = pot + allInAmount;

    setPot(newPot);
    setPlayer(p => ({ ...p, bet: newTotalBet, chips: 0, allIn: true }));
    setCurrentBet(newTotalBet);

    if (raiseAmount > 0) {
      setLastRaiseAmount(raiseAmount);
    }

    setActionMessage(`🔥 ALL-IN! ${allInAmount} chip!`, 'warning');
    setPlayerActed(true);
    setPlayerTurn(false);

    if (ai.allIn || ai.chips === 0) {
      setBettingRoundComplete(true);
      setTimeout(() => nextPhase(), 800);
    } else {
      setAiActed(false); // AI must act on the all-in
      // Pass the NEW bet and pot to AI
      setTimeout(() => aiAction(false, newTotalBet, newPot), 800);
    }
  };

  const CardComponent = ({ card, hidden = false }: { card: Card; hidden?: boolean }) => (
    <div className={`
      w-12 h-16 md:w-16 md:h-24
      rounded-xl
      flex flex-col items-center justify-center
      transform transition-all duration-200
      hover:scale-110 hover:-translate-y-1
      relative
      ${hidden
        ? 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 shadow-xl border-2 border-blue-400'
        : 'bg-white shadow-2xl border-2 border-gray-200'
      }
    `}>
      {hidden ? (
        <>
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <Image
              src="/images/logo.png"
              alt="Palace Poker"
              width={48}
              height={48}
              className="object-contain opacity-90"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl pointer-events-none"></div>
        </>
      ) : (
        <>
          <span className={`text-base md:text-2xl font-extrabold ${card.color} drop-shadow-sm`}>
            {card.value}
          </span>
          <span className={`text-xl md:text-3xl ${card.color} drop-shadow-sm`}>
            {card.suit}
          </span>
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-xl pointer-events-none"></div>
        </>
      )}
    </div>
  );

  const { smallBlind, bigBlind } = getBlinds();
  const toCall = currentBet - player.bet;
  const canCheck = toCall === 0;
  const maxBet = player.chips;
  const minRaise = currentBet > 0 ? Math.max(lastRaiseAmount, bigBlind) : bigBlind;
  const minBetAmount = toCall > 0 ? toCall + minRaise : minRaise;

  return (
    <section className="py-12 bg-gradient-to-b from-green-900 to-green-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🃏 Texas Hold'em Gyakorlás
          </h2>
          <p className="text-yellow-300 text-sm md:text-base font-semibold animate-pulse">
            Készülj fel az esti versenyeinkre! 🏆
          </p>
        </div>

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
              <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${getAIAvatar().color} rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl relative shadow-lg border-2 border-white ${getAIAvatar().animation} transition-all duration-300`}>
                {getAIAvatar().emoji}
                {dealer === 'player' ? (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">BB</span>
                ) : (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">SB</span>
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-sm md:text-base">Gép</p>
                <p className="text-yellow-400 font-bold text-sm md:text-base">{ai.chips} chip</p>
                {ai.bet > 0 && (
                  <p className="text-green-400 text-xs">Tét: {ai.bet}</p>
                )}
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
            {/* BIG ACTION DISPLAY */}
            <div className={`
              text-center mb-3 p-3 md:p-4 rounded-xl font-bold text-base md:text-2xl shadow-lg
              ${actionType === 'success' ? 'bg-green-600 text-white animate-bounce-subtle' : ''}
              ${actionType === 'danger' ? 'bg-red-600 text-white' : ''}
              ${actionType === 'warning' ? 'bg-yellow-500 text-gray-900 animate-pulse' : ''}
              ${actionType === 'info' ? 'bg-blue-500 text-white' : ''}
              ${actionType === 'neutral' ? 'bg-gray-700 text-white' : ''}
            `}>
              {message}
            </div>

            <div className="text-center mb-3">
              <p className="text-yellow-400 text-lg md:text-xl font-bold">🏆 Pot: {pot} chip</p>
              {currentBet > 0 && (
                <p className="text-green-300 text-sm md:text-base">Aktuális tét: {currentBet} chip</p>
              )}
              {playerTurn && !gameOver && phase !== 'waiting' && (
                <p className="text-green-400 text-sm md:text-lg animate-pulse mt-2 font-bold">👉 TE KÖVETKEZEL!</p>
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
                {player.bet > 0 && (
                  <p className="text-green-400 text-xs">Tét: {player.bet}</p>
                )}
                {communityCards.length >= 3 && player.hand.length === 2 && (
                  <p className="text-cyan-400 text-xs md:text-sm font-bold mt-1">
                    {getHandName(evaluateHand(player.hand, communityCards))}
                  </p>
                )}
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
                        disabled={isStartingHand}
                        className="w-full py-5 md:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl md:text-xl rounded-xl shadow-lg hover:shadow-2xl active:scale-95 transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🎮 Következő leosztás most
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={startNewGame}
                    disabled={isStartingHand}
                    className="w-full py-5 md:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl md:text-xl rounded-xl shadow-lg hover:shadow-2xl active:scale-95 transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🎮 Játék indítása
                  </button>
                )}
              </div>
            ) : !playerTurn ? (
              <div className="w-full py-5 md:py-4 bg-gray-600/50 text-white font-bold text-center rounded-xl text-lg md:text-base">
                ⏳ A gép gondolkozik...
              </div>
            ) : (
              <div className="space-y-3">
                {!canCheck && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="text-center mb-2">
                      <span className="text-yellow-400 font-bold text-lg">
                        💰 Megadás: {toCall} chip
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-3">
                  <label className="text-white text-base md:text-sm font-semibold block mb-3 md:mb-2">
                    {toCall > 0 ? 'Emelés mérete' : 'Tét mérete'}: <span className="text-yellow-400 text-lg md:text-base">{betSliderValue} chip</span>
                    {toCall > 0 && <span className="text-xs text-white/70 ml-2">(min: {minBetAmount})</span>}
                  </label>
                  <input
                    type="range"
                    min={Math.max(minBetAmount, bigBlind)}
                    max={maxBet}
                    step={bigBlind}
                    value={betSliderValue}
                    onChange={(e) => setBetSliderValue(Number(e.target.value))}
                    className="w-full h-4 md:h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 touch-manipulation"
                    disabled={!playerTurn}
                  />
                  <div className="flex justify-between text-sm md:text-xs text-white/70 mt-2 md:mt-1">
                    <span>{Math.max(minBetAmount, bigBlind)}</span>
                    <span>{maxBet}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  <button
                    onClick={handleFold}
                    className="py-4 md:py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 active:scale-95 transition-all text-base md:text-base shadow-lg touch-manipulation"
                  >
                    ❌ Dobás
                  </button>

                  {canCheck ? (
                    <button
                      onClick={handleCheck}
                      className="py-4 md:py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all text-base md:text-base shadow-lg touch-manipulation"
                    >
                      ✓ Check
                    </button>
                  ) : (
                    <button
                      onClick={handleCall}
                      className="py-4 md:py-3 bg-yellow-600 text-white font-bold rounded-xl hover:bg-yellow-700 active:scale-95 transition-all text-base md:text-base shadow-lg disabled:opacity-50 touch-manipulation"
                      disabled={toCall > player.chips}
                    >
                      {toCall >= player.chips
                        ? '🔥 All-In'
                        : `✓ Megadás (${toCall})`}
                    </button>
                  )}

                  <button
                    onClick={handleBetOrRaise}
                    className="py-4 md:py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 active:scale-95 transition-all text-base md:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    disabled={minBetAmount >= player.chips}
                  >
                    {toCall > 0 ? '⬆️ Emelés' : '💰 Tét'}
                  </button>

                  <button
                    onClick={handleAllIn}
                    className="py-4 md:py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 active:scale-95 transition-all text-base md:text-base shadow-lg touch-manipulation"
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
            <div className="text-white/90 text-xs md:text-sm space-y-3">
              <div>
                <h4 className="font-bold text-yellow-300 mb-1">🎯 Játék Célja:</h4>
                <p>Nyerd meg az összes chipet! A legjobb 5 lapos kombináció győz a 2 saját + 5 közös lapból.</p>
              </div>

              <div>
                <h4 className="font-bold text-yellow-300 mb-1">🃏 Játékmenet:</h4>
                <ul className="space-y-1 ml-4">
                  <li>• <strong>Preflop:</strong> 2 saját lap kiosztása, vakok befizetése (SB/BB)</li>
                  <li>• <strong>Flop:</strong> 3 közös lap felfordítása, licitkör</li>
                  <li>• <strong>Turn:</strong> 4. közös lap, újabb licitkör</li>
                  <li>• <strong>River:</strong> 5. közös lap, utolsó licitkör</li>
                  <li>• <strong>Showdown:</strong> Lapok felfordítása, legjobb kéz nyer</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-yellow-300 mb-1">💰 Licit Opciók:</h4>
                <ul className="space-y-1 ml-4">
                  <li>• <strong>Check:</strong> Passz (ha nincs tét előtted)</li>
                  <li>• <strong>Megadás (Call):</strong> Beszállás a jelenlegi tétbe</li>
                  <li>• <strong>Emelés (Raise):</strong> Tét növelése</li>
                  <li>• <strong>Dobás (Fold):</strong> Feladás, lapjaid eldobása</li>
                  <li>• <strong>All-In:</strong> Összes chiped beszállása</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-yellow-300 mb-1">🏆 Lapkombinációk (Erősségi sorrend):</h4>
                <ul className="space-y-1 ml-4">
                  <li>• <strong>Royal Flush:</strong> 10-J-Q-K-A azonos színben</li>
                  <li>• <strong>Straight Flush:</strong> 5 lap sorban, azonos színben</li>
                  <li>• <strong>Póker (Four of a Kind):</strong> 4 ugyanolyan érték</li>
                  <li>• <strong>Full House:</strong> 3 + 2 ugyanolyan érték</li>
                  <li>• <strong>Flush (Flöss):</strong> 5 lap azonos színben</li>
                  <li>• <strong>Straight (Sor):</strong> 5 lap sorban</li>
                  <li>• <strong>Drill (Three of a Kind):</strong> 3 ugyanolyan érték</li>
                  <li>• <strong>Két Pár:</strong> 2x2 ugyanolyan érték</li>
                  <li>• <strong>Pár:</strong> 2 ugyanolyan érték</li>
                  <li>• <strong>Magas lap:</strong> Legmagasabb lap dönt</li>
                </ul>
              </div>

              <div className="bg-white/10 p-3 rounded-lg border border-yellow-400/30">
                <p className="text-yellow-300 font-semibold">💡 Tipp:</p>
                <p>A vakok 2 percenként emelkednek - ez pontosan úgy működik mint az élő versenyeinken! Gyere el és teszteld tudásodat élőben! 🎰</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
