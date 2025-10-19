'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Team } from '@/lib/teams';
import TeamSelection from './TeamSelection';
import GameScreen from './GameScreen';
import GoalCelebration from './GoalCelebration';
import GameOverDialog from './GameOverDialog';
import DifficultySelection from './DifficultySelection';
import { getAIOpponentMove } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { teams as allTeams } from '@/lib/teams';
import { Logo } from '../icons';

export type GameState =
  | 'TEAM_SELECT'
  | 'DIFFICULTY_SELECT'
  | 'IN_GAME'
  | 'CELEBRATING'
  | 'GAME_OVER';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ShotOutcome = 'goal' | 'miss' | 'pending';
export type Shot = {
  player: ShotOutcome;
  opponent: ShotOutcome;
};

const MAX_SHOTS = 5;

export default function KiddieKickersGame() {
  const [gameState, setGameState] = useState<GameState>('TEAM_SELECT');
  const [playerTeam, setPlayerTeam] = useState<Team | null>(null);
  const [opponentTeam, setOpponentTeam] = useState<Team | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [shots, setShots] = useState<Shot[]>(
    Array(MAX_SHOTS).fill({ player: 'pending', opponent: 'pending' })
  );
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (gameState === 'TEAM_SELECT') {
      const availableTeams = allTeams.filter(t => t.id !== playerTeam?.id);
      const randomOpponent = availableTeams[Math.floor(Math.random() * availableTeams.length)];
      setOpponentTeam(randomOpponent);
    }
  }, [gameState, playerTeam]);

  const handleTeamSelect = useCallback((team: Team) => {
    setPlayerTeam(team);
    const availableTeams = allTeams.filter(t => t.id !== team.id);
    const randomOpponent = availableTeams[Math.floor(Math.random() * availableTeams.length)];
    setOpponentTeam(randomOpponent);
    setGameState('DIFFICULTY_SELECT');
  }, []);

  const handleDifficultySelect = useCallback((level: Difficulty) => {
    setDifficulty(level);
    setGameState('IN_GAME');
  }, []);
  
  const handleShot = async (aim: number) => {
    try {
      const res = await getAIOpponentMove(
        difficulty,
        'The player is taking a penalty. As the goalkeeper, where should you dive?'
      );
      const aiMove = res.strategy.toLowerCase();
      let diveDirection = 0; // Center
      if (aiMove.includes('left')) {
        diveDirection = -1;
      } else if (aiMove.includes('right')) {
        diveDirection = 1;
      }
      
      const outcome: ShotOutcome = Math.abs(aim - diveDirection) > 0.5 ? 'goal' : 'miss';

      const newShots = [...shots];
      newShots[currentShotIndex] = { ...newShots[currentShotIndex], player: outcome };
      setShots(newShots);
      
      return { outcome, diveDirection };
    } catch (error) {
      console.error('AI opponent move failed:', error);
      toast({
        title: 'Error',
        description: 'Could not get AI opponent move. Please try again.',
        variant: 'destructive',
      });
      return { outcome: 'miss' as ShotOutcome, diveDirection: 0 };
    }
  };
  
  const handleGoalScored = useCallback(() => {
    setGameState('CELEBRATING');
  }, []);

  const handleCelebrationFinish = useCallback(() => {
    if (currentShotIndex >= MAX_SHOTS - 1) {
      setGameState('GAME_OVER');
    } else {
      setCurrentShotIndex(prev => prev + 1);
      setGameState('IN_GAME');
    }
  }, [currentShotIndex]);

  const handleMiss = useCallback(() => {
     if (currentShotIndex >= MAX_SHOTS - 1) {
      setGameState('GAME_OVER');
    } else {
      setCurrentShotIndex(prev => prev + 1);
    }
  }, [currentShotIndex]);


  const handleRestart = useCallback(() => {
    setGameState('TEAM_SELECT');
    setPlayerTeam(null);
    setOpponentTeam(null);
    setShots(Array(MAX_SHOTS).fill({ player: 'pending', opponent: 'pending' }));
    setCurrentShotIndex(0);
  }, []);

  const getScores = () => {
    const playerScore = shots.filter(s => s.player === 'goal').length;
    const opponentScore = shots.filter(s => s.opponent === 'goal').length;
    return { playerScore, opponentScore };
  };

  const scores = getScores();

  const renderGameState = () => {
    switch (gameState) {
      case 'TEAM_SELECT':
        return <TeamSelection onTeamSelect={handleTeamSelect} />;
      case 'DIFFICULTY_SELECT':
        return (
            playerTeam && opponentTeam && (
                <DifficultySelection 
                    onDifficultySelect={handleDifficultySelect}
                    playerTeam={playerTeam}
                    opponentTeam={opponentTeam}
                />
            )
        );
      case 'IN_GAME':
        return (
          playerTeam &&
          opponentTeam && (
            <GameScreen
              key={currentShotIndex}
              playerTeam={playerTeam}
              opponentTeam={opponentTeam}
              onShot={handleShot}
              onGoal={handleGoalScored}
              onMiss={handleMiss}
              scores={scores}
              shots={shots}
              currentShotIndex={currentShotIndex}
            />
          )
        );
      case 'CELEBRATING':
        return (
          playerTeam && (
            <GoalCelebration
              teamName={playerTeam.name}
              playerName="Superstar"
              onFinish={handleCelebrationFinish}
            />
          )
        );
      case 'GAME_OVER':
        return <GameOverDialog scores={scores} onRestart={handleRestart} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-4 mb-8">
            <Logo className="w-16 h-16" />
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary tracking-tighter">
                Ansh_KiKi_CR7 Kickers
            </h1>
        </div>
        <div className="w-full min-h-[60vh] flex items-center justify-center">
         {renderGameState()}
        </div>
    </div>
  )
}
