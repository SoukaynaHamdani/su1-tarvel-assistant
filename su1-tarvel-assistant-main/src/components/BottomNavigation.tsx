
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Globe, User, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Home'
    },
    {
      path: '/chat',
      icon: MessageCircle,
      label: 'Chat'
    },
    {
      path: '/map',
      icon: Map,
      label: 'Map'
    },
    {
      path: '/translator',
      icon: Globe,
      label: 'Translator'
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 bg-card shadow-soft rounded-t-2xl animate-slide-up z-40">
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center transition-all duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 mb-1',
                isActive ? 'scale-110' : ''
              )} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
