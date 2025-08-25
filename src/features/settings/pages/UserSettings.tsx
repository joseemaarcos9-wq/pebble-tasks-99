import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/components/providers/NotificationProvider';
import { useTheme } from '@/hooks/useTheme';
import { User, Bell, Shield, Palette, Globe, Download, Trash2, Camera } from 'lucide-react';

interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    taskReminders: boolean;
    financialAlerts: boolean;
    weeklyReports: boolean;
  };
  display: {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    compactMode: boolean;
  };
  privacy: {
    profileVisibility: string;
    dataSharing: boolean;
    analytics: boolean;
  };
}

export default function UserSettings() {
  const { user, updateProfile } = useAuth();
  const { success, error } = useNotification();
  const { theme, setTheme } = useTheme();
  
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.user_metadata?.display_name || '',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || ''
  });
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      email: true,
      push: true,
      taskReminders: true,
      financialAlerts: true,
      weeklyReports: false
    },
    display: {
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      dateFormat: 'DD/MM/YYYY',
      currency: 'BRL',
      compactMode: false
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true
    }
  });

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        display_name: profileData.displayName,
        avatar_url: profileData.avatar
      });
      success('Perfil atualizado', 'Suas informações foram salvas com sucesso');
    } catch (err) {
      error('Erro ao atualizar perfil', 'Tente novamente em alguns instantes');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = (section: keyof UserPreferences, key: string, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleExportData = () => {
    success('Exportação iniciada', 'Seus dados serão enviados por email em breve');
  };

  const handleDeleteAccount = () => {
    error('Funcionalidade em desenvolvimento', 'Entre em contato com o suporte para excluir sua conta');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidade
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Dados
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="text-lg">
                    {profileData.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Alterar foto
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG ou GIF. Máximo 2MB.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome de exibição</Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Para alterar o email, entre em contato com o suporte
                  </p>
                </div>
              </div>
              
              <Button onClick={handleProfileUpdate} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por email</Label>
                    <p className="text-sm text-muted-foreground">Receba atualizações importantes por email</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => handlePreferencesUpdate('notifications', 'email', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações push</Label>
                    <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) => handlePreferencesUpdate('notifications', 'push', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lembretes de tarefas</Label>
                    <p className="text-sm text-muted-foreground">Notificações sobre prazos e tarefas pendentes</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.taskReminders}
                    onCheckedChange={(checked) => handlePreferencesUpdate('notifications', 'taskReminders', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas financeiros</Label>
                    <p className="text-sm text-muted-foreground">Notificações sobre orçamentos e gastos</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.financialAlerts}
                    onCheckedChange={(checked) => handlePreferencesUpdate('notifications', 'financialAlerts', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Relatórios semanais</Label>
                    <p className="text-sm text-muted-foreground">Resumo semanal de atividades</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.weeklyReports}
                    onCheckedChange={(checked) => handlePreferencesUpdate('notifications', 'weeklyReports', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aparência e Idioma</CardTitle>
              <CardDescription>
                Personalize a aparência e configurações regionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select 
                    value={preferences.display.language} 
                    onValueChange={(value) => handlePreferencesUpdate('display', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Fuso horário</Label>
                  <Select 
                    value={preferences.display.timezone} 
                    onValueChange={(value) => handlePreferencesUpdate('display', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Formato de data</Label>
                  <Select 
                    value={preferences.display.dateFormat} 
                    onValueChange={(value) => handlePreferencesUpdate('display', 'dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <Select 
                    value={preferences.display.currency} 
                    onValueChange={(value) => handlePreferencesUpdate('display', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo compacto</Label>
                  <p className="text-sm text-muted-foreground">Interface mais densa com menos espaçamento</p>
                </div>
                <Switch
                  checked={preferences.display.compactMode}
                  onCheckedChange={(checked) => handlePreferencesUpdate('display', 'compactMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacidade e Segurança</CardTitle>
              <CardDescription>
                Configure suas preferências de privacidade e segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Visibilidade do perfil</Label>
                  <Select 
                    value={preferences.privacy.profileVisibility} 
                    onValueChange={(value) => handlePreferencesUpdate('privacy', 'profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Privado</SelectItem>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="friends">Apenas amigos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compartilhamento de dados</Label>
                    <p className="text-sm text-muted-foreground">Permitir compartilhamento de dados para melhorias</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.dataSharing}
                    onCheckedChange={(checked) => handlePreferencesUpdate('privacy', 'dataSharing', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">Permitir coleta de dados de uso anônimos</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.analytics}
                    onCheckedChange={(checked) => handlePreferencesUpdate('privacy', 'analytics', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Dados</CardTitle>
              <CardDescription>
                Exporte ou exclua seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Exportar dados</h4>
                      <p className="text-sm text-muted-foreground">
                        Baixe uma cópia de todos os seus dados
                      </p>
                    </div>
                    <Button onClick={handleExportData} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border border-destructive/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-destructive">Excluir conta</h4>
                      <p className="text-sm text-muted-foreground">
                        Exclua permanentemente sua conta e todos os dados
                      </p>
                    </div>
                    <Button onClick={handleDeleteAccount} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}