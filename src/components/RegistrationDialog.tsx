import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface RegistrationDialogProps {
  open: boolean;
  onComplete: (username: string) => void;
}

export default function RegistrationDialog({ open, onComplete }: RegistrationDialogProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 3) {
      onComplete(username.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Icon name="User" className="text-primary" size={28} />
            Добро пожаловать!
          </DialogTitle>
          <DialogDescription className="text-base">
            Введите ваше имя, чтобы оно отображалось в таблице лидеров
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-base">
              Имя игрока
            </Label>
            <Input
              id="username"
              placeholder="Введите ваше имя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={20}
              required
              className="text-lg"
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              Минимум 3 символа, максимум 20
            </p>
          </div>
          <Button
            type="submit"
            className="w-full text-lg font-semibold"
            size="lg"
            disabled={username.trim().length < 3}
          >
            <Icon name="CheckCircle2" className="mr-2" size={20} />
            Начать играть
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
