import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, ArrowRight } from 'lucide-react';

export default function AuthPlaceholder() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <CheckSquare className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold">Pebble Tasks</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Lista de tarefas minimalista e rápida
          </p>
        </div>

        <Card className="shadow-medium">
          <CardHeader className="space-y-3">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-xl">Autenticação</CardTitle>
              <Badge variant="secondary" className="text-xs">
                Placeholder
              </Badge>
            </div>
            <CardDescription>
              A autenticação real será implementada na fase backend com Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button size="lg" className="w-full" disabled>
                Entrar
              </Button>
              <Button size="lg" variant="outline" className="w-full" disabled>
                Registrar
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/app')}
              >
                <span>Acessar Demo</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Explore o app com dados de exemplo
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Desenvolvido com React + TypeScript + Zustand
          </p>
        </div>
      </div>
    </div>
  );
}