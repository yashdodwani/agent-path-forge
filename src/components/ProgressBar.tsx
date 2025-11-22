import { motion } from 'framer-motion';

interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

export const ProgressBar = ({ completed, total, className = '' }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium text-primary">{percentage}%</span>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full gradient-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      
      <div className="text-xs text-muted-foreground">
        {completed} of {total} modules completed
      </div>
    </div>
  );
};
