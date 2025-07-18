import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        });

        if (signUpError) {
          toast.error(signUpError.message);
          return;
        }

        if (data.user) {
          // Insert username into profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: data.user.id, 
              username: username 
            });

          if (profileError) {
            toast.error(profileError.message);
            return;
          }

          toast.success("Account created successfully!");
          // No need to login again, the user is automatically logged in
          navigate('/dashboard');
        }
      } else {
        // Login Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (data.user) {
          toast.success("Logged in successfully!");
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error("Authentication failed");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Create Account' : 'Login'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {isSignUp && (
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
          </form>
          <div className="text-center mt-4">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp 
                ? 'Already have an account? Login' 
                : 'Need an account? Sign Up'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
