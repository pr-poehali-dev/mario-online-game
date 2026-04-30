import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import Leaderboard from '@/components/Leaderboard';
import RegistrationDialog from '@/components/RegistrationDialog';
import ProfileSettings from '@/components/ProfileSettings';
import CommunityLevels from '@/components/CommunityLevels';
import MyLevels from '@/components/MyLevels';

type BlockType = 'platform' | 'coin' | 'enemy' | 'flag' | 'star' | 'mushroom' | 'pipe' | 'empty';

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

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  reward: number;
  condition: (stats: GameStats) => boolean;
}

interface GameStats {
  levelsCreated: number;
  levelsCompleted: number;
  coinsCollected: number;
  totalCredits: number;
}

interface ShopItem {
  id: BlockType;
  name: string;
  emoji: string;
  price: number;
  unlocked: boolean;
  description: string;
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
  const [credits, setCredits] = useState(0);
  const [stats, setStats] = useState<GameStats>({
    levelsCreated: 0,
    levelsCompleted: 0,
    coinsCollected: 0,
    totalCredits: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-level',
      title: 'Первый шаг',
      description: 'Создайте свой первый уровень',
      icon: '🏗️',
      unlocked: false,
      reward: 50,
      condition: (s) => s.levelsCreated >= 1,
    },
    {
      id: 'five-levels',
      title: 'Архитектор',
      description: 'Создайте 5 уровней',
      icon: '🏛️',
      unlocked: false,
      reward: 150,
      condition: (s) => s.levelsCreated >= 5,
    },
    {
      id: 'ten-levels',
      title: 'Мастер-строитель',
      description: 'Создайте 10 уровней',
      icon: '👷',
      unlocked: false,
      reward: 300,
      condition: (s) => s.levelsCreated >= 10,
    },
    {
      id: 'collector',
      title: 'Коллекционер',
      description: 'Соберите 100 монет',
      icon: '💰',
      unlocked: false,
      reward: 100,
      condition: (s) => s.coinsCollected >= 100,
    },
    {
      id: 'completionist',
      title: 'Перфекционист',
      description: 'Пройдите 10 уровней',
      icon: '🏆',
      unlocked: false,
      reward: 200,
      condition: (s) => s.levelsCompleted >= 10,
    },
  ]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([
    {
      id: 'star',
      name: 'Звезда',
      emoji: '⭐',
      price: 100,
      unlocked: false,
      description: 'Дает временную неуязвимость',
    },
    {
      id: 'mushroom',
      name: 'Гриб',
      emoji: '🍄',
      price: 150,
      unlocked: false,
      description: 'Увеличивает персонажа',
    },
    {
      id: 'pipe',
      name: 'Труба',
      emoji: '🟢',
      price: 200,
      unlocked: false,
      description: 'Телепорт между трубами',
    },
  ]);
  const [username, setUsername] = useState<string>('');
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('mario-username');
    if (!storedUsername) {
      setShowRegistration(true);
    } else {
      setUsername(storedUsername);
    }

    const stored = localStorage.getItem('mario-levels');
    if (stored) {
      setSavedLevels(JSON.parse(stored));
    }

    const storedStats = localStorage.getItem('mario-stats');
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }

    const storedCredits = localStorage.getItem('mario-credits');
    if (storedCredits) {
      setCredits(parseInt(storedCredits));
    }

    const storedAchievements = localStorage.getItem('mario-achievements');
    if (storedAchievements) {
      setAchievements(JSON.parse(storedAchievements));
    }

    const storedShop = localStorage.getItem('mario-shop');
    if (storedShop) {
      setShopItems(JSON.parse(storedShop));
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
              setCredits(prev => {
                const newCredits = prev + 5;
                localStorage.setItem('mario-credits', newCredits.toString());
                return newCredits;
              });
              setStats(prev => {
                const newStats = { ...prev, coinsCollected: prev.coinsCollected + 1, totalCredits: prev.totalCredits + 5 };
                localStorage.setItem('mario-stats', JSON.stringify(newStats));
                checkAchievements(newStats);
                return newStats;
              });
              toast({
                title: "Монета собрана! 🪙",
                description: `+10 очков, +5 кредитов`,
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
              const completionBonus = 50;
              setCredits(prev => {
                const newCredits = prev + completionBonus;
                localStorage.setItem('mario-credits', newCredits.toString());
                return newCredits;
              });
              setStats(prev => {
                const newStats = { ...prev, levelsCompleted: prev.levelsCompleted + 1, totalCredits: prev.totalCredits + completionBonus };
                localStorage.setItem('mario-stats', JSON.stringify(newStats));
                checkAchievements(newStats);
                return newStats;
              });
              toast({
                title: "Уровень пройден! 🎉",
                description: `Ваш счёт: ${score}, +${completionBonus} кредитов`,
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

  const checkAchievements = (newStats: GameStats) => {
    setAchievements(prev => {
      const updated = prev.map(ach => {
        if (!ach.unlocked && ach.condition(newStats)) {
          setCredits(c => {
            const newCredits = c + ach.reward;
            localStorage.setItem('mario-credits', newCredits.toString());
            return newCredits;
          });
          toast({
            title: `Достижение разблокировано! ${ach.icon}`,
            description: `${ach.title}: +${ach.reward} кредитов`,
          });
          return { ...ach, unlocked: true };
        }
        return ach;
      });
      localStorage.setItem('mario-achievements', JSON.stringify(updated));
      return updated;
    });
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

    setStats(prev => {
      const newStats = { ...prev, levelsCreated: prev.levelsCreated + 1 };
      localStorage.setItem('mario-stats', JSON.stringify(newStats));
      checkAchievements(newStats);
      return newStats;
    });

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

  const buyShopItem = (itemId: BlockType) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;

    if (credits < item.price) {
      toast({
        title: "Недостаточно кредитов",
        description: `Нужно ${item.price}, у вас ${credits}`,
        variant: "destructive",
      });
      return;
    }

    setCredits(prev => {
      const newCredits = prev - item.price;
      localStorage.setItem('mario-credits', newCredits.toString());
      return newCredits;
    });

    setShopItems(prev => {
      const updated = prev.map(i => i.id === itemId ? { ...i, unlocked: true } : i);
      localStorage.setItem('mario-shop', JSON.stringify(updated));
      return updated;
    });

    toast({
      title: `${item.emoji} Куплено!`,
      description: `${item.name} теперь доступен в редакторе`,
    });
  };

  const getBlockEmoji = (type: BlockType) => {
    switch (type) {
      case 'platform': return '🟫';
      case 'coin': return '🪙';
      case 'enemy': return '👾';
      case 'flag': return '🚩';
      case 'star': return '⭐';
      case 'mushroom': return '🍄';
      case 'pipe': return '🟢';
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

  const handleRegistrationComplete = (name: string) => {
    setUsername(name);
    localStorage.setItem('mario-username', name);
    setShowRegistration(false);
    toast({
      title: `Добро пожаловать, ${name}! 🎮`,
      description: 'Создавайте уровни и соревнуйтесь за место в таблице лидеров!',
    });
  };

  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem('mario-username', newUsername);
  };

  const handlePlayCommunityLevel = (level: any) => {
    setCurrentLevel({
      id: level.id,
      name: level.name,
      blocks: level.blocks,
    });
    setEditorBlocks(level.blocks);
    const tabsList = document.querySelector('[role="tablist"]');
    const gameTab = tabsList?.querySelector('[value="game"]') as HTMLElement;
    gameTab?.click();
    toast({
      title: `Уровень загружен! 🎮`,
      description: `"${level.name}" от ${level.author}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100 p-8">
      <RegistrationDialog open={showRegistration} onComplete={handleRegistrationComplete} />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-primary mb-3 drop-shadow-lg">
            🍄 Марио Онлайн
          </h1>
          <p className="text-xl text-foreground/80">
            Играй и создавай собственные уровни!
          </p>
          {username && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <Icon name="User" size={20} className="text-[#E94E87]" />
              <span className="text-lg font-semibold text-[#4A90E2]">Игрок: {username}</span>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <Card className="px-6 py-3">
            <div className="flex items-center gap-3">
              <Icon name="Coins" className="text-secondary" size={28} />
              <div>
                <p className="text-xs text-muted-foreground">Кредиты</p>
                <p className="text-2xl font-bold text-primary">{credits}</p>
              </div>
            </div>
          </Card>
          <Card className="px-6 py-3">
            <div className="flex items-center gap-3">
              <Icon name="Award" className="text-accent" size={28} />
              <div>
                <p className="text-xs text-muted-foreground">Достижения</p>
                <p className="text-2xl font-bold text-primary">5/5</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="game" className="w-full">
          <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-7 mb-6">
            <TabsTrigger value="game" className="text-lg font-semibold">
              <Icon name="Gamepad2" className="mr-2" size={20} />
              Игра
            </TabsTrigger>
            <TabsTrigger value="levels" className="text-lg font-semibold">
              <Icon name="FolderOpen" className="mr-2" size={20} />
              Мои уровни
            </TabsTrigger>
            <TabsTrigger value="community" className="text-lg font-semibold">
              <Icon name="Globe" className="mr-2" size={20} />
              Сообщество
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-lg font-semibold">
              <Icon name="Trophy" className="mr-2" size={20} />
              Лидеры
            </TabsTrigger>
            <TabsTrigger value="shop" className="text-lg font-semibold">
              <Icon name="ShoppingBag" className="mr-2" size={20} />
              Магазин
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-lg font-semibold">
              <Icon name="Award" className="mr-2" size={20} />
              Достижения
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-lg font-semibold">
              <Icon name="Settings" className="mr-2" size={20} />
              Профиль
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
                  <div className="text-2xl font-bold text-primary">Количество очков: 0</div>
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
                      <div className="rounded-xl p-6 shadow-2xl text-center bg-yellow-400">
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
                    {(['platform', 'coin', 'enemy', 'flag'] as BlockType[]).map(type => (
                      <Button
                        key={type}
                        variant={selectedBlock === type ? 'default' : 'outline'}
                        className="h-20 text-3xl font-semibold flex-col gap-2"
                        onClick={() => setSelectedBlock(type)}
                      >
                        <span className="text-4xl text-lime-400">{getBlockEmoji(type)}</span>
                        <span className="text-xs">
                          {type === 'platform' && 'Платформа'}
                          {type === 'coin' && 'Монета'}
                          {type === 'enemy' && 'Враг'}
                          {type === 'flag' && 'Флаг'}
                        </span>
                      </Button>
                    ))}
                    {shopItems.filter(item => item.unlocked).map(item => (
                      <Button
                        key={item.id}
                        variant={selectedBlock === item.id ? 'default' : 'outline'}
                        className="h-20 text-3xl font-semibold flex-col gap-2"
                        onClick={() => setSelectedBlock(item.id)}
                      >
                        <span className="text-4xl">{item.emoji}</span>
                        <span className="text-xs">{item.name}</span>
                      </Button>
                    ))}
                    <Button
                      variant={selectedBlock === 'empty' ? 'default' : 'outline'}
                      className="h-20 text-3xl font-semibold flex-col gap-2"
                      onClick={() => setSelectedBlock('empty')}
                    >
                      <span className="text-4xl">🗑️</span>
                      <span className="text-xs">Стереть</span>
                    </Button>
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
            <MyLevels
              levels={savedLevels}
              onPlayLevel={(level) => {
                loadLevel(level);
                const tabsList = document.querySelector('[role="tablist"]');
                const gameTab = tabsList?.querySelector('[value="game"]') as HTMLElement;
                gameTab?.click();
              }}
              onDeleteLevel={deleteLevel}
            />
          </TabsContent>

          <TabsContent value="community">
            <CommunityLevels onPlayLevel={handlePlayCommunityLevel} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard 
              currentPlayerName={username}
              currentPlayerStats={{
                levelsCompleted: stats.levelsCompleted,
                coinsCollected: stats.coinsCollected,
                achievementsUnlocked: achievements.filter(a => a.unlocked).length,
              }}
            />
          </TabsContent>

          <TabsContent value="shop">
            <Card className="p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Icon name="ShoppingBag" className="mr-3 text-secondary" size={32} />
                Магазин объектов
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.map(item => (
                  <Card 
                    key={item.id} 
                    className={`p-6 transition-all border-2 ${
                      item.unlocked 
                        ? 'bg-accent/10 border-accent' 
                        : 'hover:shadow-lg hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-3">{item.emoji}</div>
                      <h3 className="font-bold text-xl mb-2">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    </div>
                    
                    {item.unlocked ? (
                      <div className="flex items-center justify-center gap-2 text-accent font-semibold">
                        <Icon name="CheckCircle2" size={20} />
                        <span>Куплено</span>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => buyShopItem(item.id)}
                        className="w-full font-semibold"
                        size="lg"
                      >🛍️       Купить за 0 🪙 </Button>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Icon name="Trophy" className="mr-3 text-secondary" size={32} />
                Достижения
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="flex items-center gap-4">
                    <Icon name="MapPin" className="text-primary" size={40} />
                    <div>
                      <p className="text-sm text-muted-foreground">Уровней создано</p>
                      <p className="text-3xl font-bold">{stats.levelsCreated}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5">
                  <div className="flex items-center gap-4">
                    <Icon name="CheckCircle2" className="text-accent" size={40} />
                    <div>
                      <p className="text-sm text-muted-foreground">Уровней пройдено</p>
                      <p className="text-3xl font-bold">{stats.levelsCompleted}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5">
                  <div className="flex items-center gap-4">
                    <Icon name="Coins" className="text-secondary" size={40} />
                    <div>
                      <p className="text-sm text-muted-foreground">Монет собрано</p>
                      <p className="text-3xl font-bold">{stats.coinsCollected}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                  <div className="flex items-center gap-4">
                    <Icon name="Sparkles" className="text-yellow-600" size={40} />
                    <div>
                      <p className="text-sm text-muted-foreground">Всего заработано</p>
                      <p className="text-3xl font-bold">{stats.totalCredits} 🪙</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-3">
                {achievements.map(achievement => (
                  <Card 
                    key={achievement.id}
                    className={`p-6 transition-all border-2 ${
                      achievement.unlocked
                        ? 'bg-accent/10 border-accent shadow-md'
                        : 'opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-1">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <div className="text-right">
                        {achievement.unlocked ? (
                          <div className="flex items-center gap-2 text-accent font-semibold">
                            <Icon name="CheckCircle2" size={24} />
                            <span>Получено</span>
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-primary">+ 5000 🪙 </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <ProfileSettings 
              currentUsername={username}
              onUsernameChange={handleUsernameChange}
            />
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