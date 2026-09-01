import { Module } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModuleCardProps {
  module: Module;
  status: 'not_started' | 'in_progress' | 'completed';
  onClick: () => void;
}

export const ModuleCard = ({ module, status, onClick }: ModuleCardProps) => {
  const statusConfig = {
    not_started: { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted' },
    in_progress: { icon: Circle, color: 'text-accent', bg: 'bg-accent/10' },
    completed: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <Card 
        className={`p-4 cursor-pointer transition-all hover:shadow-lg border-2 ${
          status === 'completed' ? 'border-success/30' : 'border-transparent'
        }`}
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${config.bg}`}>
            <StatusIcon className={`h-5 w-5 ${config.color}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">
              {module.module_name}
            </h3>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {module.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {module.estimated_time}
              </div>

              <div>
                {module.skills_covered.length} skills
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {module.skills_covered.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {module.skills_covered.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{module.skills_covered.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};