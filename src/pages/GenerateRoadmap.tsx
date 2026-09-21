import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, X, Upload, FileText, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { roadmapApi, conversationApi } from '@/api/client';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { UserProfile } from '@/types/api';

type Mode = 'manual' | 'docs';
type JdMode = 'url' | 'text' | 'file';

const ACCEPTED_DOC_TYPES = ['.pdf', '.docx', '.txt', '.md'];
const MAX_RESUME_SIZE_MB = 10;
const MAX_JD_FILE_SIZE_MB = 10;

const GenerateRoadmap = () => {
  const navigate = useNavigate();
  const { setModules, setUserProfile, setConversationId, setGapAnalysis } = useAppStore();

  const [mode, setMode] = useState<Mode>('manual');
  const [isLoading, setIsLoading] = useState(false);

  // ---- Manual profile form state (unchanged flow) ----
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

  // ---- Resume + Job Description form state (new flow) ----
  const [docsName, setDocsName] = useState('');
  const [docsTargetRole, setDocsTargetRole] = useState('');
  const [docsPreferredStyle, setDocsPreferredStyle] = useState<UserProfile['preferred_style']>('Video');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [jdMode, setJdMode] = useState<JdMode>('url');
  const [jobUrl, setJobUrl] = useState('');
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState<File | null>(null);

  const validateAndSetFile = (
    file: File | undefined,
    maxSizeMb: number,
    setFile: (f: File | null) => void,
    inputEl: HTMLInputElement
  ) => {
    if (!file) {
      setFile(null);
      return;
    }
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_DOC_TYPES.includes(ext)) {
      toast.error(`Unsupported file type. Please upload: ${ACCEPTED_DOC_TYPES.join(', ')}`);
      inputEl.value = '';
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`File too large. Max size is ${maxSizeMb}MB.`);
      inputEl.value = '';
      return;
    }
    setFile(file);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0], MAX_RESUME_SIZE_MB, setResumeFile, e.target);
  };

  const handleJdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0], MAX_JD_FILE_SIZE_MB, setJdFile, e.target);
  };

  // ---- Submit: manual profile flow ----
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.target_role || formData.current_skills.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const conversation = await conversationApi.createConversation(formData);
      setConversationId(conversation.conversation_id);

      const roadmap = await roadmapApi.generateRoadmap(formData);

      const modules = Array.isArray(roadmap)
        ? roadmap
        : Array.isArray((roadmap as any).modules)
        ? (roadmap as any).modules
        : Array.isArray((roadmap as any).roadmap)
        ? (roadmap as any).roadmap
        : null;

      if (!modules) {
        toast.error('Received unexpected response from backend');
        setIsLoading(false);
        return;
      }

      setModules(modules);
      setUserProfile(formData);
      setGapAnalysis(null); // manual flow has no gap analysis

      toast.success('Roadmap generated successfully!');
      navigate('/');
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Backend is taking longer than expected. It might be starting up. Please try again in a moment.');
      } else {
        toast.error('Failed to generate roadmap. Please try again.');
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Submit: resume + JD flow ----
  const handleDocsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!docsName || !docsTargetRole) {
      toast.error('Please fill in your name and target role');
      return;
    }
    if (!resumeFile) {
      toast.error('Please upload your resume');
      return;
    }
    if (jdMode === 'url' && !jobUrl.trim()) {
      toast.error('Please paste the job posting URL');
      return;
    }
    if (jdMode === 'text' && !jdText.trim()) {
      toast.error('Please paste the job description text');
      return;
    }
    if (jdMode === 'file' && !jdFile) {
      toast.error('Please upload the job description file');
      return;
    }

    setIsLoading(true);

    try {
      const roadmap = await roadmapApi.generateRoadmapFromDocs({
        name: docsName,
        target_role: docsTargetRole,
        preferred_style: docsPreferredStyle,
        resume: resumeFile,
        job_url: jdMode === 'url' ? jobUrl.trim() : undefined,
        jd_text: jdMode === 'text' ? jdText.trim() : undefined,
        jd_file: jdMode === 'file' ? jdFile ?? undefined : undefined,
      });

      const modules = Array.isArray(roadmap)
        ? roadmap
        : Array.isArray((roadmap as any).modules)
        ? (roadmap as any).modules
        : Array.isArray((roadmap as any).roadmap)
        ? (roadmap as any).roadmap
        : null;

      if (!modules) {
        toast.error('Received unexpected response from backend');
        setIsLoading(false);
        return;
      }

      setModules(modules);
      setGapAnalysis(roadmap.gap_analysis ?? null);
      setUserProfile({
        name: docsName,
        current_role: '',
        target_role: docsTargetRole,
        current_skills: roadmap.gap_analysis?.matched_skills ?? [],
        preferred_style: docsPreferredStyle,
        experience_level: 'Beginner',
      });
      if (roadmap.roadmap_id) {
        setConversationId(roadmap.roadmap_id);
      }

      toast.success('Roadmap generated from your resume and the job description!');
      navigate('/');
    } catch (error: any) {
      const backendDetail = error.response?.data?.detail;
      if (backendDetail) {
        toast.error(backendDetail);
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Backend is taking longer than expected. It might be starting up. Please try again in a moment.');
      } else {
        toast.error('Failed to generate roadmap. Please try again.');
      }
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

        {/* Mode toggle */}
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant={mode === 'manual' ? 'default' : 'outline'}
            onClick={() => setMode('manual')}
          >
            Manual Profile
          </Button>
          <Button
            type="button"
            variant={mode === 'docs' ? 'default' : 'outline'}
            onClick={() => setMode('docs')}
          >
            Resume + Job Post
          </Button>
        </div>

        {mode === 'manual' ? (
          <Card className="p-8 glass">
            <form onSubmit={handleManualSubmit} className="space-y-6">
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
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
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
        ) : (
          <Card className="p-8 glass">
            <form onSubmit={handleDocsSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="docs_name">Name *</Label>
                <Input
                  id="docs_name"
                  value={docsName}
                  onChange={(e) => setDocsName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>

              {/* Target Role */}
              <div className="space-y-2">
                <Label htmlFor="docs_target_role">Target Role *</Label>
                <Input
                  id="docs_target_role"
                  value={docsTargetRole}
                  onChange={(e) => setDocsTargetRole(e.target.value)}
                  placeholder="e.g., Full Stack Developer, ML Engineer"
                  required
                />
              </div>

              {/* Resume upload */}
              <div className="space-y-2">
                <Label htmlFor="resume_upload">Resume *</Label>
                <label
                  htmlFor="resume_upload"
                  className="flex items-center gap-3 border border-dashed rounded-md px-4 py-6 cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    {resumeFile ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate text-sm">{resumeFile.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Click to upload PDF, DOCX, or TXT (max {MAX_RESUME_SIZE_MB}MB)
                      </span>
                    )}
                  </div>
                </label>
                <input
                  id="resume_upload"
                  type="file"
                  accept={ACCEPTED_DOC_TYPES.join(',')}
                  onChange={handleResumeChange}
                  className="hidden"
                  required
                />
              </div>

              {/* Job description source toggle */}
              <div className="space-y-2">
                <Label>Job Description *</Label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    variant={jdMode === 'url' ? 'default' : 'outline'}
                    onClick={() => setJdMode('url')}
                    className="gap-1"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    Job Link
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={jdMode === 'text' ? 'default' : 'outline'}
                    onClick={() => setJdMode('text')}
                    className="gap-1"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Paste JD Text
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={jdMode === 'file' ? 'default' : 'outline'}
                    onClick={() => setJdMode('file')}
                    className="gap-1"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload JD File
                  </Button>
                </div>

                {jdMode === 'url' && (
                  <>
                    <Input
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="https://company.com/careers/job-posting"
                    />
                    <p className="text-xs text-muted-foreground">
                      Some job boards (LinkedIn, Workday, etc.) block automated fetching — if this fails, switch to
                      "Paste JD Text" or "Upload JD File" instead.
                    </p>
                  </>
                )}

                {jdMode === 'text' && (
                  <Textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={8}
                  />
                )}

                {jdMode === 'file' && (
                  <>
                    <label
                      htmlFor="jd_file_upload"
                      className="flex items-center gap-3 border border-dashed rounded-md px-4 py-6 cursor-pointer hover:border-primary transition-colors"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        {jdFile ? (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="truncate text-sm">{jdFile.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Click to upload the job posting as PDF, DOCX, or TXT (max {MAX_JD_FILE_SIZE_MB}MB)
                          </span>
                        )}
                      </div>
                    </label>
                    <input
                      id="jd_file_upload"
                      type="file"
                      accept={ACCEPTED_DOC_TYPES.join(',')}
                      onChange={handleJdFileChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* Preferred Learning Style */}
              <div className="space-y-2">
                <Label htmlFor="docs_style">Preferred Learning Style</Label>
                <Select
                  value={docsPreferredStyle}
                  onValueChange={(value: any) => setDocsPreferredStyle(value)}
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
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Resume & Job Description...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Gaps & Generate Roadmap
                  </>
                )}
              </Button>
            </form>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default GenerateRoadmap;