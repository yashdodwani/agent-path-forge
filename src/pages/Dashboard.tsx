import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, TrendingUp, BookOpen, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { ProgressBar } from '@/components/ProgressBar';
import { ThreeDGraph } from '@/components/ThreeDGraph';
import { ChatPanel } from '@/components/ChatPanel';

const Dashboard = () => {
  const navigate = useNavigate();
  const { modules, moduleProgress, setSelectedModuleId } = useAppStore();

  const completedCount = Object.values(moduleProgress).filter(s => s === 'completed').length;
  const hasRoadmap = modules.length > 0;

  const handleModuleClick = (moduleId: number) => {
    setSelectedModuleId(moduleId);
    navigate(`/roadmaps/${moduleId}`);
  };

  const renderChatPanel = (delay = 0.6) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="lg:col-span-1"
    >
      <ChatPanel />
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 py-12 gradient-hero rounded-2xl"
      >
        <h1 className="text-4xl md:text-5xl font-bold">
          Your Personalized Learning Journey
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          AI-powered roadmaps tailored to your goals, skills, and learning style
        </p>
        <Button
          size="lg"
          onClick={() => navigate('/roadmaps/new')}
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Create New Roadmap
        </Button>
      </motion.div>

      {hasRoadmap ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 glass">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Modules</p>
                    <p className="text-2xl font-bold">{modules.length}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 glass">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-success/10">
                    <Target className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{completedCount}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 glass">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold">
                      {modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 glass">
              <ProgressBar completed={completedCount} total={modules.length} />
            </Card>
          </motion.div>

          {/* 3D Graph and Chat Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="p-6 glass h-full">
                <h2 className="text-2xl font-bold mb-4">Your Learning Path</h2>
                <div className="h-[600px] rounded-lg overflow-hidden">
                  <ThreeDGraph modules={modules} onModuleClick={handleModuleClick} />
                </div>
              </Card>
            </motion.div>

            {renderChatPanel()}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-12 text-center glass h-full">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">No Roadmap Yet</h3>
                <p className="text-muted-foreground">
                  Create your first personalized learning roadmap to get started on your journey
                </p>
                <Button onClick={() => navigate('/roadmaps/new')} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Roadmap
                </Button>
              </div>
            </Card>
          </motion.div>

          {renderChatPanel(0.3)}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
