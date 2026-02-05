import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ProfileSettingsProps {
  currentUsername: string;
  onUsernameChange: (newUsername: string) => void;
}

export default function ProfileSettings({ currentUsername, onUsernameChange }: ProfileSettingsProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState(currentUsername);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (username.trim().length >= 3) {
      onUsernameChange(username.trim());
      setIsEditing(false);
      toast({
        title: 'Имя изменено! ✅',
        description: `Теперь вы - ${username.trim()}`,
      });
    }
  };

  const handleCancel = () => {
    setUsername(currentUsername);
    setIsEditing(false);
  };

  return (
    <Card className="p-6 bg-white/95 backdrop-blur-sm border-2 border-[#4A90E2]">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="Settings" size={32} className="text-[#E94E87]" />
        <h2 className="text-3xl font-bold text-[#4A90E2]">Настройки профиля</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-lg font-semibold text-[#4A90E2]">
            Имя игрока
          </Label>
          {isEditing ? (
            <div className="space-y-3">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                maxLength={20}
                className="text-lg"
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                Минимум 3 символа, максимум 20
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={username.trim().length < 3}
                  className="font-semibold"
                >
                  <Icon name="CheckCircle2" className="mr-2" size={18} />
                  Сохранить
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <Icon name="X" className="mr-2" size={18} />
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-[#4A90E2] bg-[#4A90E2]/10 px-4 py-2 rounded-lg">
                {currentUsername}
              </div>
              <Button onClick={() => setIsEditing(true)} variant="outline">Изменить имя ✏️</Button>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#4A90E2]/20">
          <h3 className="text-lg font-semibold text-[#4A90E2] mb-3">
            О вашем аккаунте
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Ваше имя отображается в таблице лидеров</p>
            <p>• Изменение имени сохранит всю вашу статистику</p>
            <p>• Выбирайте уникальное имя для узнаваемости</p>
          </div>
        </div>
      </div>
    </Card>
  );
}