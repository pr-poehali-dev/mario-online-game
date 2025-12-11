import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface LeaderboardEntry {
  name: string;
  score: number;
  levelsCompleted: number;
  coinsCollected: number;
  achievements: number;
  isCurrentPlayer?: boolean;
}

interface LeaderboardProps {
  currentPlayerName?: string;
  currentPlayerStats?: {
    levelsCompleted: number;
    coinsCollected: number;
    achievementsUnlocked: number;
  };
}

export default function Leaderboard({ currentPlayerName, currentPlayerStats }: LeaderboardProps) {
  const leaderboardData = useMemo(() => {
    const baseData: LeaderboardEntry[] = [
      {
        name: 'Марио Мастер',
        score: 15420,
        levelsCompleted: 25,
        coinsCollected: 450,
        achievements: 8,
      },
      {
        name: 'Луиджи Про',
        score: 12850,
        levelsCompleted: 20,
        coinsCollected: 380,
        achievements: 7,
      },
      {
        name: 'Пич Королева',
        score: 11200,
        levelsCompleted: 18,
        coinsCollected: 320,
        achievements: 6,
      },
      {
        name: 'Боузер Босс',
        score: 9500,
        levelsCompleted: 15,
        coinsCollected: 280,
        achievements: 5,
      },
      {
        name: 'Йоши Быстрый',
        score: 8200,
        levelsCompleted: 12,
        coinsCollected: 240,
        achievements: 5,
      },
    ];

    if (currentPlayerName && currentPlayerStats) {
      const playerScore = 
        currentPlayerStats.levelsCompleted * 500 + 
        currentPlayerStats.coinsCollected * 10 + 
        currentPlayerStats.achievementsUnlocked * 200;

      const currentPlayer: LeaderboardEntry = {
        name: currentPlayerName,
        score: playerScore,
        levelsCompleted: currentPlayerStats.levelsCompleted,
        coinsCollected: currentPlayerStats.coinsCollected,
        achievements: currentPlayerStats.achievementsUnlocked,
        isCurrentPlayer: true,
      };

      const allPlayers = [...baseData, currentPlayer];
      return allPlayers
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    }

    return baseData;
  }, [currentPlayerName, currentPlayerStats]);

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank.toString();
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500';
      case 2:
        return 'bg-gray-400/20 text-gray-700 border-gray-400';
      case 3:
        return 'bg-orange-500/20 text-orange-700 border-orange-500';
      default:
        return 'bg-blue-500/20 text-blue-700 border-blue-500';
    }
  };

  return (
    <Card className="p-6 bg-white/95 backdrop-blur-sm border-2 border-[#4A90E2]">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="Trophy" size={32} className="text-[#E94E87]" />
        <h2 className="text-3xl font-bold text-[#4A90E2]">Таблица лидеров</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] text-center">Место</TableHead>
            <TableHead>Игрок</TableHead>
            <TableHead className="text-center">Очки</TableHead>
            <TableHead className="text-center">Уровни</TableHead>
            <TableHead className="text-center">Монеты</TableHead>
            <TableHead className="text-center">Достижения</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboardData.map((entry, index) => {
            const rank = index + 1;
            return (
              <TableRow 
                key={`${entry.name}-${rank}`} 
                className={`hover:bg-[#4A90E2]/5 ${entry.isCurrentPlayer ? 'bg-[#E94E87]/10 border-l-4 border-[#E94E87]' : ''}`}
              >
                <TableCell className="text-center">
                  <Badge variant="outline" className={`text-2xl ${getRankColor(rank)}`}>
                    {getMedalEmoji(rank)}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-[#4A90E2]">
                  {entry.name}
                  {entry.isCurrentPlayer && (
                    <Badge className="ml-2 bg-[#E94E87]">
                      Вы
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon name="Star" size={16} className="text-[#E94E87]" />
                    <span className="font-bold text-[#E94E87]">{entry.score}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon name="Flag" size={16} className="text-[#50B498]" />
                    <span className="text-[#50B498] font-medium">{entry.levelsCompleted}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg">🪙</span>
                    <span className="text-[#FFD700] font-medium">{entry.coinsCollected}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon name="Award" size={16} className="text-[#FF8C42]" />
                    <span className="text-[#FF8C42] font-medium">{entry.achievements}</span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-6 p-4 bg-[#4A90E2]/10 rounded-lg border-2 border-[#4A90E2]/30">
        <div className="flex items-center gap-2 text-sm text-[#4A90E2]">
          <Icon name="Info" size={16} />
          <span>Играйте, собирайте монеты и выполняйте достижения, чтобы подняться в рейтинге!</span>
        </div>
      </div>
    </Card>
  );
}