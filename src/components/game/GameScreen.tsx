'use client';

import { useState, useEffect } from 'react';
import { type Team } from '@/lib/teams';
import type { Shot, ShotOutcome } from './KiddieKickersGame';
import Pitch from './Pitch';
import Controls from './Controls';
import Scoreboard from './Scoreboard';
import { AnimatePresence, motion } from 'framer-motion';

type GameScreenProps = {
  playerTeam: Team;
  opponentTeam: Team;
  scores: { playerScore: number; opponentScore: number };
  shots: Shot[];
  currentShotIndex: number;
  onShot: (
    aim: number
  ) => Promise<{ outcome: ShotOutcome; diveDirection: number }>;
  onGoal: () => void;
  onMiss: () => void;
};

export default function GameScreen({
  playerTeam,
  opponentTeam,
  scores,
  shots,
  currentShotIndex,
  onShot,
  onGoal,
  onMiss,
}: GameScreenProps) {
  const [isShooting, setIsShooting] = useState(false);
  const [shotResult, setShotResult] = useState<{ outcome: ShotOutcome; diveDirection: number } | null>(null);
  const [shotMessage, setShotMessage] = useState<string | null>(null);

  const handleShoot = async (aim: number) => {
    if (isShooting) return;
    setIsShooting(true);
    setShotMessage(null);
    const result = await onShot(aim);
    setShotResult(result);
    
    setTimeout(() => {
        setShotMessage(result.outcome === 'goal' ? 'GOAL!' : 'SAVED!');
    }, 1000); // Animation time

    setTimeout(() => {
      if (result.outcome === 'goal') {
        onGoal();
      } else {
        onMiss();
      }
      setIsShooting(false);
      setShotMessage(null);
    }, 3000); // Time to show message before moving on
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <Scoreboard
        playerTeam={playerTeam}
        opponentTeam={opponentTeam}
        scores={scores}
        shots={shots}
      />
      <div className="relative w-full max-w-2xl aspect-[4/3] bg-green-600 rounded-lg overflow-hidden shadow-2xl border-4 border-white/50">
        <Pitch
            isKicking={isShooting}
            shotResult={shotResult}
        />
         <AnimatePresence>
          {shotMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <h2 className={`text-6xl font-extrabold font-headline tracking-tighter text-white text-shadow-lg ${shotMessage === 'GOAL!' ? 'text-accent' : 'text-primary'}`}
                style={{ WebkitTextStroke: '3px black' }}>
                {shotMessage}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Controls onShoot={handleShoot} disabled={isShooting} />
    </div>
  );
}
