import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type BlockType = 'platform' | 'coin' | 'enemy' | 'flag' | 'empty';

interface Block {
  type: BlockType;
  x: number;
  y: number;
}

interface Level {
  id: string;
  name: string;
  blocks: Block[];
  thumbnail?: string;
}

interface Player {
  x: number;
  y: number;
  velocityY: number;
  isJumping: boolean;
}

const GRID_SIZE = 40;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 480;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;

export default function Index() {
  const { toast } = useToast();
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('platform');
  const [editorBlocks, setEditorBlocks] = useState<Block[]>([]);
  const [savedLevels, setSavedLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState<Player>({ x: 80, y: 320, velocityY: 0, isJumping: false });
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [score, setScore] = useState(0);
  const [collectedCoins, setCollectedCoins] = useState<string[]>([]);
  const gameLoopRef = useRef<number>();

  useEffect(() => {
    const stored = localStorage.getItem('mario-levels');
    if (stored) {
      setSavedLevels(JSON.parse(stored));
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const gameLoop = () => {
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let newVelocityY = prev.velocityY + GRAVITY;
        let newIsJumping = prev.isJumping;

        if (keys['ArrowLeft'] || keys['a'] || keys['A'] || keys['ф'] || keys['Ф']) {
          newX = Math.max(0, prev.x - MOVE_SPEED);
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D'] || keys['в'] || keys['В']) {
          newX = Math.min(CANVAS_WIDTH - 40, prev.x + MOVE_SPEED);
        }

        if ((keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' '] || keys['ц'] || keys['Ц']) && !prev.isJumping) {
          newVelocityY = JUMP_FORCE;
          newIsJumping = true;
        }

        newY += newVelocityY;

        const blocks = currentLevel?.blocks || editorBlocks;
        let onGround = false;

        if (newY >= CANVAS_HEIGHT - 80) {
          newY = CANVAS_HEIGHT - 80;
          newVelocityY = 0;
          newIsJumping = false;
          onGround = true;
        }

        blocks.forEach(block => {
          if (block.type === 'platform') {
            if (
              newX + 40 > block.x &&
              newX < block.x + GRID_SIZE &&
              newY + 40 >= block.y &&
              newY + 40 <= block.y + 10 &&
              newVelocityY >= 0
            ) {
              newY = block.y - 40;
              newVelocityY = 0;
              newIsJumping = false;
              onGround = true;
            }
          }

          if (block.type === 'coin') {
            const coinKey = `${block.x}-${block.y}`;
            if (
              !collectedCoins.includes(coinKey) &&
              newX + 40 > block.x &&
              newX < block.x + GRID_SIZE &&
              newY + 40 > block.y &&
              newY < block.y + GRID_SIZE
            ) {
              setCollectedCoins(prev => [...prev, coinKey]);
              setScore(prev => prev + 10);
              toast({
                title: "Монета собрана! 🪙",
                description: `+10 очков`,
              });
            }
          }

          if (block.type === 'flag') {
            if (
              newX + 40 > block.x &&
              newX < block.x + GRID_SIZE &&
              newY + 40 > block.y &&
              newY < block.y + GRID_SIZE
            ) {
              toast({
                title: "Уровень пройден! 🎉",
                description: `Ваш счёт: ${score}`,
              });
              setIsPlaying(false);
            }
          }
        });

        return {
          x: newX,
          y: newY,
          velocityY: newVelocityY,
          isJumping: newIsJumping,
        };
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, keys, editorBlocks, currentLevel, collectedCoins, score, toast]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPlaying) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE) * GRID_SIZE;
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE) * GRID_SIZE;

    if (selectedBlock === 'empty') {
      setEditorBlocks(prev => prev.filter(b => !(b.x === x && b.y === y)));
    } else {
      const existingIndex = editorBlocks.findIndex(b => b.x === x && b.y === y);
      if (existingIndex >= 0) {
        setEditorBlocks(prev => prev.map((b, i) => i === existingIndex ? { ...b, type: selectedBlock } : b));
      } else {
        setEditorBlocks(prev => [...prev, { type: selectedBlock, x, y }]);
      }
    }
  };

  const saveLevel = () => {
    const levelName = prompt('Название уровня:');
    if (!levelName) return;

    const newLevel: Level = {
      id: Date.now().toString(),
      name: levelName,
      blocks: [...editorBlocks],
    };

    const updated = [...savedLevels, newLevel];
    setSavedLevels(updated);
    localStorage.setItem('mario-levels', JSON.stringify(updated));

    toast({
      title: "Уровень сохранён! ✅",
      description: `"${levelName}" добавлен в вашу коллекцию`,
    });
  };

  const loadLevel = (level: Level) => {
    setCurrentLevel(level);
    setEditorBlocks(level.blocks);
    toast({
      title: "Уровень загружен",
      description: `"${level.name}" готов к игре`,
    });
  };

  const startGame = () => {
    setIsPlaying(true);
    setPlayer({ x: 80, y: 320, velocityY: 0, isJumping: false });
    setScore(0);
    setCollectedCoins([]);
  };

  const stopGame = () => {
    setIsPlaying(false);
  };

  const clearEditor = () => {
    setEditorBlocks([]);
    setCurrentLevel(null);
    toast({
      title: "Редактор очищен",
      description: "Создайте новый уровень",
    });
  };

  const deleteLevel = (levelId: string) => {
    const updated = savedLevels.filter(l => l.id !== levelId);
    setSavedLevels(updated);
    localStorage.setItem('mario-levels', JSON.stringify(updated));
    toast({
      title: "Уровень удалён",
    });
  };

  const getBlockEmoji = (type: BlockType) => {
    switch (type) {
      case 'platform': return '🟫';
      case 'coin': return '🪙';
      case 'enemy': return '👾';
      case 'flag': return '🚩';
      default: return '';
    }
  };

  const renderBlock = (block: Block) => {
    const isCollected = collectedCoins.includes(`${block.x}-${block.y}`);
    if (block.type === 'coin' && isCollected) return null;

    return (
      <div
        key={`${block.x}-${block.y}`}
        className="absolute flex items-center justify-center text-3xl transition-transform hover:scale-110"
        style={{
          left: block.x,
          top: block.y,
          width: GRID_SIZE,
          height: GRID_SIZE,
          transform: block.type === 'coin' ? 'rotateY(0deg)' : 'none',
          animation: block.type === 'coin' ? 'spin 2s linear infinite' : 'none',
        }}
      >
        {getBlockEmoji(block.type)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-primary mb-3 drop-shadow-lg">
            🍄 Марио Онлайн
          </h1>
          <p className="text-xl text-foreground/80">
            Играй и создавай собственные уровни!
          </p>
        </div>

        <Tabs defaultValue="game" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="game" className="text-lg font-semibold">
              <Icon name="Gamepad2" className="mr-2" size={20} />
              Игра
            </TabsTrigger>
            <TabsTrigger value="levels" className="text-lg font-semibold">
              <Icon name="FolderOpen" className="mr-2" size={20} />
              Мои уровни
            </TabsTrigger>
          </TabsList>

          <TabsContent value="game">
            <div className="grid lg:grid-cols-[1fr_300px] gap-6">
              <Card className="p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    {!isPlaying ? (
                      <>
                        <Button onClick={startGame} size="lg" className="font-semibold">
                          <Icon name="Play" className="mr-2" size={20} />
                          Играть
                        </Button>
                        <Button onClick={clearEditor} variant="outline" size="lg">
                          <Icon name="Trash2" className="mr-2" size={20} />
                          Очистить
                        </Button>
                        <Button onClick={saveLevel} variant="secondary" size="lg" className="font-semibold">
                          <Icon name="Save" className="mr-2" size={20} />
                          Сохранить
                        </Button>
                      </>
                    ) : (
                      <Button onClick={stopGame} variant="destructive" size="lg" className="font-semibold">
                        <Icon name="Square" className="mr-2" size={20} />
                        Стоп
                      </Button>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    Счёт: {score}
                  </div>
                </div>

                <div
                  className="relative bg-gradient-to-b from-sky-400 to-sky-300 rounded-lg overflow-hidden cursor-crosshair border-4 border-primary/20 shadow-inner"
                  style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
                  onClick={handleCanvasClick}
                >
                  {(currentLevel?.blocks || editorBlocks).map(renderBlock)}

                  <div
                    className="absolute bg-red-500 rounded-md shadow-lg transition-all duration-75 border-2 border-red-700"
                    style={{
                      left: player.x,
                      top: player.y,
                      width: 40,
                      height: 40,
                      transform: keys['ArrowLeft'] ? 'scaleX(-1)' : 'scaleX(1)',
                    }}
                  >
                    <div className="text-2xl flex items-center justify-center h-full">
                      👨
                    </div>
                  </div>

                  {!isPlaying && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-white/95 rounded-xl p-6 shadow-2xl text-center">
                        <Icon name="Gamepad2" className="mx-auto mb-3 text-primary" size={48} />
                        <h3 className="text-2xl font-bold mb-2">Режим редактора</h3>
                        <p className="text-muted-foreground">
                          Кликайте на поле для добавления блоков
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {isPlaying && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-center font-semibold text-foreground/80">
                      Управление: ← → или A D для движения, ↑ или W или Пробел для прыжка
                    </p>
                  </div>
                )}
              </Card>

              <div className="space-y-4">
                <Card className="p-6 shadow-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Icon name="Wrench" className="mr-2 text-primary" size={24} />
                    Инструменты
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(['platform', 'coin', 'enemy', 'flag', 'empty'] as BlockType[]).map(type => (
                      <Button
                        key={type}
                        variant={selectedBlock === type ? 'default' : 'outline'}
                        className="h-20 text-3xl font-semibold flex-col gap-2"
                        onClick={() => setSelectedBlock(type)}
                      >
                        <span className="text-4xl">{getBlockEmoji(type)}</span>
                        <span className="text-xs">
                          {type === 'platform' && 'Платформа'}
                          {type === 'coin' && 'Монета'}
                          {type === 'enemy' && 'Враг'}
                          {type === 'flag' && 'Флаг'}
                          {type === 'empty' && 'Стереть'}
                        </span>
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 shadow-xl">
                  <h3 className="text-xl font-bold mb-3 flex items-center">
                    <Icon name="Info" className="mr-2 text-primary" size={24} />
                    Справка
                  </h3>
                  <div className="space-y-2 text-sm text-foreground/70">
                    <p>🟫 Платформы - для перемещения</p>
                    <p>🪙 Монеты - собирайте для очков</p>
                    <p>👾 Враги - пока декоративные</p>
                    <p>🚩 Флаг - финиш уровня</p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="levels">
            <Card className="p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Icon name="Trophy" className="mr-3 text-secondary" size={32} />
                Сохранённые уровни
              </h2>

              {savedLevels.length === 0 ? (
                <div className="text-center py-16">
                  <Icon name="FolderOpen" className="mx-auto mb-4 text-muted-foreground" size={64} />
                  <p className="text-xl text-muted-foreground mb-2">Пока нет сохранённых уровней</p>
                  <p className="text-muted-foreground">Создайте свой первый уровень в редакторе!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedLevels.map(level => (
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
                          onClick={() => {
                            loadLevel(level);
                            const tabsList = document.querySelector('[role="tablist"]');
                            const gameTab = tabsList?.querySelector('[value="game"]') as HTMLElement;
                            gameTab?.click();
                          }}
                          size="sm"
                          className="flex-1 font-semibold"
                        >
                          <Icon name="Play" className="mr-1" size={16} />
                          Играть
                        </Button>
                        <Button
                          onClick={() => deleteLevel(level.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
