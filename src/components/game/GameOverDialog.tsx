'use client';

import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Trophy, ShieldX, Grip } from 'lucide-react';

type GameOverDialogProps = {
  scores: { playerScore: number; opponentScore: number };
  onRestart: () => void;
};

export default function GameOverDialog({ scores, onRestart }: GameOverDialogProps) {
  const { playerScore, opponentScore } = scores;
  let result: 'win' | 'lose' | 'draw';
  let title: string;
  let Icon: React.ElementType;
  let colorClass: string;

  if (playerScore > opponentScore) {
    result = 'win';
    title = 'You Won!';
    Icon = Trophy;
    colorClass = 'text-yellow-400';
  } else if (playerScore < opponentScore) {
    result = 'lose';
    title = 'You Lost!';
    Icon = ShieldX;
    colorClass = 'text-red-500';
  } else {
    result = 'draw';
    title = "It's a Draw!";
    Icon = Grip;
    colorClass = 'text-muted-foreground';
  }

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center">
            <Icon className={`w-20 h-20 mb-4 ${colorClass}`} />
          <AlertDialogTitle className="text-4xl font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            Final Score: {playerScore} - {opponentScore}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onRestart} className="w-full text-lg bg-primary hover:bg-primary/90 text-primary-foreground">
            Play Again
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
