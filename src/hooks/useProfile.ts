import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update profile
  const updateProfile = async (updates: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'timezone'>>) => {
    if (!user) return { error: { message: 'Usuário não autenticado' } };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      setProfile(data);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      return { data, error: null };
    } catch (error: unknown) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, fetchProfile]);

  // Setup realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
}