import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Block {
  type: string;
  x: number;
  y: number;
}

interface Level {
  id: string;
  name: string;
  blocks: Block[];
  thumbnail?: string;
}

interface MyLevelsProps {
  levels: Level[];
  onPlayLevel: (level: Level) => void;
  onDeleteLevel: (levelId: string) => void;
}

export default function MyLevels({ levels, onPlayLevel, onDeleteLevel }: MyLevelsProps) {
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
    <Card className="p-8 shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <Icon name="FolderOpen" className="mr-3 text-secondary" size={32} />
        Мои уровни
      </h2>

      {levels.length === 0 ? (
        <div className="text-center py-16">
          <Icon name="FolderOpen" className="mx-auto mb-4 text-muted-foreground" size={64} />
          <p className="text-xl text-muted-foreground mb-2">Пока нет сохранённых уровней</p>
          <p className="text-muted-foreground">Создайте свой первый уровень в редакторе!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => (
            <Card key={level.id} className="p-4 hover:shadow-lg transition-all border-2 hover:border-primary/50">
              <div className="mb-3">
                <div className="bg-sky-300 rounded-lg h-32 flex items-center justify-center text-4xl relative overflow-hidden">
                  {level.blocks.slice(0, 8).map((block, i) => (
                    <span key={i} className="absolute" style={{ left: i * 20, top: 50 }}>
                      {getBlockEmoji(block.type)}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="font-bold text-lg mb-3">{level.name}</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => onPlayLevel(level)}
                  size="sm"
                  className="flex-1 font-semibold"
                >
                  <Icon name="Play" className="mr-1" size={16} />
                  Играть
                </Button>
                <Button onClick={() => onDeleteLevel(level.id)} variant="destructive" size="sm">
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
