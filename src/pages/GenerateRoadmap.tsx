import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { roadmapApi, conversationApi } from '@/api/client';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { UserProfile } from '@/types/api';

const GenerateRoadmap = () => {
  const navigate = useNavigate();
  const { setModules, setUserProfile, setConversationId } = useAppStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    current_role: '',
    target_role: '',
    current_skills: [],
    preferred_style: 'Video',
    experience_level: 'Beginner',
  });
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.current_skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        current_skills: [...formData.current_skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      current_skills: formData.current_skills.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.target_role || formData.current_skills.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Create conversation first
      const conversation = await conversationApi.createConversation();
      setConversationId(conversation.conversation_id);

      // Generate roadmap
      const roadmap = await roadmapApi.generateRoadmap(formData);
      
      setModules(roadmap.modules);
      setUserProfile(formData);
      
      toast.success('Roadmap generated successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to generate roadmap. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Generate Your Roadmap
          </h1>
          <p className="text-muted-foreground">
            Tell us about yourself and your goals, and we'll create a personalized learning path
          </p>
        </div>

        <Card className="p-8 glass">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>

            {/* Current Role */}
            <div className="space-y-2">
              <Label htmlFor="current_role">Current Role</Label>
              <Input
                id="current_role"
                value={formData.current_role}
                onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                placeholder="e.g., Student, Junior Developer"
              />
            </div>

            {/* Target Role */}
            <div className="space-y-2">
              <Label htmlFor="target_role">Target Role *</Label>
              <Input
                id="target_role"
                value={formData.target_role}
                onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                placeholder="e.g., Full Stack Developer, Data Scientist"
                required
              />
            </div>

            {/* Current Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills">Current Skills *</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Add a skill and press Enter"
                />
                <Button type="button" onClick={handleAddSkill} variant="secondary">
                  Add
                </Button>
              </div>
              {formData.current_skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.current_skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select
                value={formData.experience_level}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, experience_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Learning Style */}
            <div className="space-y-2">
              <Label htmlFor="style">Preferred Learning Style</Label>
              <Select
                value={formData.preferred_style}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, preferred_style: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Article">Article</SelectItem>
                  <SelectItem value="Interactive">Interactive</SelectItem>
                  <SelectItem value="Book">Book</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Your Roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Roadmap
                </>
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default GenerateRoadmap;
