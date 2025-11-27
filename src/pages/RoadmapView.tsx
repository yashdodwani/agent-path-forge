import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Box, MessageSquare, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { ThreeDGraph } from '@/components/ThreeDGraph';
import { ModuleCard } from '@/components/ModuleCard';
import { ModuleDetailPanel } from '@/components/ModuleDetailPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { ProgressBar } from '@/components/ProgressBar';
import { conversationApi } from '@/api/client';
import { toast } from 'sonner';

const RoadmapView = () => {
  const navigate = useNavigate();
  const {
    modules,
    moduleProgress,
    selectedModuleId,
    setSelectedModuleId,
    viewMode,
    setViewMode,
    conversationId,
    setModules,
  } = useAppStore();

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const selectedModule = modules.find((m) => m.id === selectedModuleId) || null;
  const completedCount = Object.values(moduleProgress).filter((s) => s === 'completed').length;

  const handleModuleClick = (moduleId: number) => {
    setSelectedModuleId(moduleId);
  };

  const handleRegenerate = async () => {
    if (!conversationId) {
      toast.error('No active conversation');
      return;
    }

    setIsRegenerating(true);
    try {
      const roadmap = await conversationApi.regenerateRoadmap(conversationId);

      // Defensive extraction similar to GenerateRoadmap
      const modules = Array.isArray(roadmap)
        ? roadmap
        : Array.isArray((roadmap as any).modules)
        ? (roadmap as any).modules
        : Array.isArray((roadmap as any).roadmap)
        ? (roadmap as any).roadmap
        : null;

      if (!modules) {
        console.warn('regenerateRoadmap returned unexpected shape:', roadmap);
        toast.error('Received unexpected response from backend');
        setIsRegenerating(false);
        return;
      }

      setModules(modules);
      toast.success('Roadmap regenerated successfully!');
    } catch (error) {
      toast.error('Failed to regenerate roadmap');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (modules.length === 0) {
    navigate('/roadmaps/new');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Learning Roadmap</h1>
          <p className="text-muted-foreground">
            Interactive 3D visualization of your personalized learning path
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowChat(!showChat)}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            {showChat ? 'Hide' : 'Show'} Assistant
          </Button>
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="gap-2"
          >
            {isRegenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Regenerate
          </Button>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 glass">
          <ProgressBar completed={completedCount} total={modules.length} />
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph / List View */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={showChat ? 'lg:col-span-2' : 'lg:col-span-3'}
        >
          <Card className="p-6 glass">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as '3d' | '2d')}>
              <TabsList className="mb-4">
                <TabsTrigger value="3d" className="gap-2">
                  <Box className="h-4 w-4" />
                  3D View
                </TabsTrigger>
                <TabsTrigger value="2d" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  List View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="3d" className="h-[600px]">
                <ThreeDGraph modules={modules} onModuleClick={handleModuleClick} />
              </TabsContent>

              <TabsContent value="2d" className="space-y-4 max-h-[600px] overflow-y-auto">
                {modules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    status={moduleProgress[module.id] || 'not_started'}
                    onClick={() => handleModuleClick(module.id)}
                  />
                ))}
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Chat Panel */}
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <ChatPanel />
          </motion.div>
        )}
      </div>

      {/* Module Detail Panel */}
      <ModuleDetailPanel
        module={selectedModule}
        onClose={() => setSelectedModuleId(null)}
      />
    </div>
  );
};

export default RoadmapView;
