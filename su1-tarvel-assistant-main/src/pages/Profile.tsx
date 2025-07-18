
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Profile = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      // Get the username from the profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();
        
      setUserName(profileData?.username || session.user.email?.split('@')[0] || 'User');
    };

    getProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error) {
      toast.error("Failed to logout");
    }
  };
  
  return (
    <div className="pb-20 animate-fade-in">
      <div className="bg-primary text-primary-foreground p-6">
        <h1 className="text-xl font-semibold">Welcome, {userName}</h1>
        <p className="text-sm opacity-90">Manage your account</p>
      </div>
      
      <div className="p-4">
        <Card className="mb-6 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle>My Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={undefined} alt={userName || 'User'} />
                <AvatarFallback>{userName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userName || 'Anonymous User'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          
          <Button variant="outline" className="w-full justify-start text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">SU1 App v1.0.0</p>
          <p className="text-xs text-muted-foreground">Your smart travel companion</p>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
