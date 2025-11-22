import { Module } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Clock, 
  BookOpen, 
  ExternalLink, 
  CheckCircle, 
  Circle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { conversationApi } from '@/api/client';
import { toast } from 'sonner';

interface ModuleDetailPanelProps {
  module: Module | null;
  onClose: () => void;
}

export const ModuleDetailPanel = ({ module, onClose }: ModuleDetailPanelProps) => {
  const { moduleProgress, setModuleProgress, conversationId } = useAppStore();

  if (!module) return null;

  const status = moduleProgress[module.id] || 'not_started';

  const handleStatusChange = async (newStatus: 'not_started' | 'in_progress' | 'completed') => {
    if (!conversationId) {
      toast.error('No active conversation');
      return;
    }

    try {
      await conversationApi.updateProgress(conversationId, {
        module_id: module.id,
        status: newStatus,
      });
      
      setModuleProgress(module.id, newStatus);
      toast.success(`Module marked as ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-16 bottom-0 w-full md:w-[480px] bg-background border-l shadow-2xl z-40 overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{module.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {module.estimated_duration}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {module.resources.length} resources
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Status Controls */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={status === 'not_started' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('not_started')}
                className="flex items-center gap-2"
              >
                <Circle className="h-4 w-4" />
                Not Started
              </Button>
              <Button
                variant={status === 'in_progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('in_progress')}
                className="flex items-center gap-2"
              >
                <Circle className="h-4 w-4 text-accent" />
                In Progress
              </Button>
              <Button
                variant={status === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('completed')}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 text-success" />
                Completed
              </Button>
            </div>
          </Card>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{module.description}</p>
          </div>

          {/* Skills Covered */}
          <div>
            <h3 className="font-semibold mb-3">Skills Covered</h3>
            <div className="flex flex-wrap gap-2">
              {module.skills_covered.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3">Learning Resources</h3>
            <div className="space-y-2">
              {module.resources.map((resource, index) => (
                <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{resource.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                        {resource.estimated_time && (
                          <span>{resource.estimated_time}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          {module.prerequisites.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Prerequisites</h3>
              <p className="text-sm text-muted-foreground">
                Complete modules {module.prerequisites.join(', ')} first
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
