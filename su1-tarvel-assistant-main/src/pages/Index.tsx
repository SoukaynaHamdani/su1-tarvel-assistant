
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-semibold text-primary mb-2">SU1</h1>
        <p className="text-muted-foreground">Your smart travel companion</p>
      </div>
      
      <div className="space-y-4 w-full max-w-xs">
        <Button 
          asChild 
          className="w-full" 
          variant="default"
        >
          <Link to="/auth">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
