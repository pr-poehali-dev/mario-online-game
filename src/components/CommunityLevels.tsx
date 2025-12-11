import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Block {
  type: string;
  x: number;
  y: number;
}

interface CommunityLevel {
  id: string;
  name: string;
  author: string;
  blocks: Block[];
  difficulty: 'easy' | 'medium' | 'hard';
  rating: number;
  plays: number;
}

interface CommunityLevelsProps {
  onPlayLevel: (level: CommunityLevel) => void;
}

export default function CommunityLevels({ onPlayLevel }: CommunityLevelsProps) {
  const communityLevels: CommunityLevel[] = [
    {
      id: 'comm-1',
      name: 'Прыжки смерти',
      author: 'Марио Мастер',
      blocks: [
        { type: 'platform', x: 80, y: 440 },
        { type: 'platform', x: 200, y: 400 },
        { type: 'platform', x: 320, y: 360 },
        { type: 'coin', x: 240, y: 340 },
        { type: 'flag', x: 720, y: 320 },
      ],
      difficulty: 'hard',
      rating: 4.8,
      plays: 245,
    },
    {
      id: 'comm-2',
      name: 'Золотая лихорадка',
      author: 'Луиджи Про',
      blocks: [
        { type: 'platform', x: 80, y: 440 },
        { type: 'platform', x: 200, y: 440 },
        { type: 'coin', x: 160, y: 400 },
        { type: 'coin', x: 240, y: 400 },
        { type: 'coin', x: 320, y: 400 },
        { type: 'platform', x: 400, y: 440 },
        { type: 'flag', x: 720, y: 400 },
      ],
      difficulty: 'easy',
      rating: 4.5,
      plays: 450,
    },
    {
      id: 'comm-3',
      name: 'Опасный путь',
      author: 'Пич Королева',
      blocks: [
        { type: 'platform', x: 80, y: 440 },
        { type: 'enemy', x: 200, y: 400 },
        { type: 'platform', x: 320, y: 380 },
        { type: 'coin', x: 360, y: 320 },
        { type: 'enemy', x: 480, y: 360 },
        { type: 'flag', x: 720, y: 320 },
      ],
      difficulty: 'medium',
      rating: 4.6,
      plays: 320,
    },
    {
      id: 'comm-4',
      name: 'Небесная дорога',
      author: 'Боузер Босс',
      blocks: [
        { type: 'platform', x: 80, y: 440 },
        { type: 'platform', x: 160, y: 360 },
        { type: 'platform', x: 280, y: 280 },
        { type: 'coin', x: 320, y: 240 },
        { type: 'platform', x: 440, y: 200 },
        { type: 'flag', x: 720, y: 160 },
      ],
      difficulty: 'hard',
      rating: 4.9,
      plays: 180,
    },
    {
      id: 'comm-5',
      name: 'Первые шаги',
      author: 'Йоши Быстрый',
      blocks: [
        { type: 'platform', x: 80, y: 440 },
        { type: 'platform', x: 200, y: 440 },
        { type: 'platform', x: 320, y: 440 },
        { type: 'coin', x: 240, y: 400 },
        { type: 'flag', x: 720, y: 400 },
      ],
      difficulty: 'easy',
      rating: 4.2,
      plays: 620,
    },
    {
      id: 'comm-6',
      name: 'Лабиринт монет',
      author: 'Марио Мастер',
      blocks: [
        { type: 'platform', x: 80, y: 440 },
        { type: 'platform', x: 80, y: 320 },
        { type: 'coin', x: 120, y: 280 },
        { type: 'platform', x: 240, y: 360 },
        { type: 'coin', x: 280, y: 320 },
        { type: 'platform', x: 400, y: 400 },
        { type: 'coin', x: 440, y: 360 },
        { type: 'flag', x: 720, y: 360 },
      ],
      difficulty: 'medium',
      rating: 4.7,
      plays: 290,
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-700 border-green-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500';
      case 'hard':
        return 'bg-red-500/20 text-red-700 border-red-500';
      default:
        return 'bg-blue-500/20 text-blue-700 border-blue-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Легко';
      case 'medium':
        return 'Средне';
      case 'hard':
        return 'Сложно';
      default:
        return difficulty;
    }
  };

  const getBlockEmoji = (type: string) => {
    switch (type) {
      case 'platform':
        return '🟫';
      case 'coin':
        return '🪙';
      case 'enemy':
        return '👾';
      case 'flag':
        return '🚩';
      case 'star':
        return '⭐';
      case 'mushroom':
        return '🍄';
      case 'pipe':
        return '🟢';
      default:
        return '⬜';
    }
  };

  return (
    <Card className="p-6 bg-white/95 backdrop-blur-sm border-2 border-[#4A90E2]">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="Globe" size={32} className="text-[#E94E87]" />
        <h2 className="text-3xl font-bold text-[#4A90E2]">Уровни сообщества</h2>
      </div>

      <div className="mb-6 p-4 bg-[#50B498]/10 rounded-lg border-2 border-[#50B498]/30">
        <div className="flex items-center gap-2 text-sm text-[#50B498]">
          <Icon name="Info" size={16} />
          <span>Играйте в уровни других игроков и делитесь своими творениями!</span>
        </div>
      </div>

      {communityLevels.length === 0 ? (
        <div className="text-center py-16">
          <Icon name="Inbox" className="mx-auto mb-4 text-muted-foreground" size={64} />
          <p className="text-xl text-muted-foreground mb-2">Пока нет уровней сообщества</p>
          <p className="text-muted-foreground">Создайте свой уровень и поделитесь им первым!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communityLevels.map((level) => (
            <Card key={level.id} className="p-4 hover:shadow-lg transition-all border-2 hover:border-[#4A90E2]/50">
              <div className="mb-3">
                <div className="bg-sky-300 rounded-lg h-32 flex items-center justify-center relative overflow-hidden">
                  {level.blocks.slice(0, 8).map((block, i) => (
                    <span
                      key={i}
                      className="absolute text-2xl"
                      style={{
                        left: (i % 4) * 30 + 10,
                        top: Math.floor(i / 4) * 40 + 30,
                      }}
                    >
                      {getBlockEmoji(block.type)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <h3 className="font-bold text-lg text-[#4A90E2]">{level.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="User" size={14} />
                  <span>{level.author}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={getDifficultyColor(level.difficulty)}>
                    {getDifficultyText(level.difficulty)}
                  </Badge>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Icon name="Star" size={14} className="text-[#FFD700]" />
                      <span>{level.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Play" size={14} className="text-[#50B498]" />
                      <span>{level.plays}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => onPlayLevel(level)}
                className="w-full font-semibold"
                size="sm"
              >
                <Icon name="Play" className="mr-2" size={16} />
                Играть
              </Button>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
