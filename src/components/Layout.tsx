import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Activity, Moon, Sun } from 'lucide-react';
import { healthApi } from '@/api/client';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [health, setHealth] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await healthApi.checkHealth();
        setHealth(response.status);
      } catch (error) {
        setHealth('unhealthy');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <GraduationCap className="h-8 w-8 text-primary" />
            </motion.div>
            <span className="text-xl font-bold text-primary">
              EDUPATH
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/roadmaps/new"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/roadmaps/new' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Create Roadmap
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Health Status */}
            <div className="flex items-center gap-2">
              <Activity className={`h-4 w-4 ${
                health === 'healthy' ? 'text-success' : 
                health === 'unhealthy' ? 'text-destructive' : 
                'text-muted-foreground'
              }`} />
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {health === 'checking' ? 'Checking...' : health}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 EduPath AI - Powered by Agentic Learning</p>
        </div>
      </footer>
    </div>
  );
};
