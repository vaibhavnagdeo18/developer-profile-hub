import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Github, 
  Linkedin, 
  Twitter, 
  MapPin, 
  Link as LinkIcon, 
  Mail, 
  Edit2, 
  Sparkles, 
  Save, 
  X,
  Loader2,
  Moon,
  Sun,
  Share2,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
interface Profile {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  website: string;
  profilePicture: string;
  skills: string[];
  socials: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

// Validation Schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  location: z.string().optional(),
  email: z.string().email("Invalid email address"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  profilePicture: z.string().url("Invalid Image URL").optional().or(z.literal("")),
  skills: z.string(), // We'll parse this from comma-separated string
  github: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

// Mock Initial Data
const initialProfile: Profile = {
  name: "Alex Rivera",
  title: "Senior Full Stack Developer",
  bio: "Passionate about building scalable web applications and intuitive user experiences. Specialized in React, Node.js, and cloud architecture. Always learning and exploring new technologies to solve real-world problems.",
  location: "San Francisco, CA",
  email: "alex.rivera@example.com",
  website: "https://alexrivera.dev",
  profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
  skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Tailwind CSS", "PostgreSQL", "Next.js"],
  socials: {
    github: "https://github.com/alexrivera",
    linkedin: "https://linkedin.com/in/alexrivera",
    twitter: "https://twitter.com/alexrivera",
  }
};

const BIO_TEMPLATES = [
  "As a {title}, I specialize in {skills}. I am dedicated to building robust and scalable solutions that solve complex business challenges.",
  "Innovative {title} with expertise in {skills}. I love turning complex problems into simple, beautiful, and intuitive designs.",
  "Results-driven {title} focused on {skills}. I bring a creative approach to problem-solving and a commitment to code quality."
];

export default function Home() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load theme from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleDownloadResume = () => {
    toast({
      title: "Downloading Resume",
      description: "Starting download for Resume.pdf...",
    });
  };

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      title: profile.title,
      bio: profile.bio,
      location: profile.location,
      email: profile.email,
      website: profile.website,
      profilePicture: profile.profilePicture,
      skills: profile.skills.join(", "),
      github: profile.socials.github,
      linkedin: profile.socials.linkedin,
      twitter: profile.socials.twitter,
    },
  });

  // Effect to update form when profile changes
  useEffect(() => {
    if (isEditing) {
      form.reset({
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        location: profile.location,
        email: profile.email,
        website: profile.website,
        profilePicture: profile.profilePicture,
        skills: profile.skills.join(", "),
        github: profile.socials.github,
        linkedin: profile.socials.linkedin,
        twitter: profile.socials.twitter,
      });
    }
  }, [profile, isEditing, form]);

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    // Simulate API call
    setTimeout(() => {
      setProfile({
        name: values.name,
        title: values.title,
        bio: values.bio,
        location: values.location || "",
        email: values.email,
        website: values.website || "",
        profilePicture: values.profilePicture || "",
        skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
        socials: {
          github: values.github || "",
          linkedin: values.linkedin || "",
          twitter: values.twitter || "",
        }
      });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile changes have been saved successfully.",
      });
    }, 800);
  };

  const generateAIBio = async () => {
    const currentSkills = form.getValues("skills");
    const currentTitle = form.getValues("title");
    
    if (!currentSkills || !currentTitle) {
      toast({
        title: "Missing Information",
        description: "Please enter your job title and skills to generate a bio.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingBio(true);
    
    // Simulate AI Generation with delay and random template
    setTimeout(() => {
      const template = BIO_TEMPLATES[Math.floor(Math.random() * BIO_TEMPLATES.length)];
      const generatedBio = template
        .replace("{title}", currentTitle)
        .replace("{skills}", currentSkills.split(",").slice(0, 3).join(", ") + " and more");
      
      form.setValue("bio", generatedBio);
      setIsGeneratingBio(false);
      toast({
        title: "Bio Generated",
        description: "A new professional bio has been created for you.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 font-sans text-foreground">
      {/* Navbar */}
      <nav className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-heading font-bold text-xl flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              P
            </div>
            <span className="hidden sm:inline">Profile Project</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" data-testid="button-theme-toggle">
                  {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Theme</TooltipContent>
            </Tooltip>

            {!isEditing && (
              <>
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
                <Button onClick={() => setIsEditing(true)} size="sm" className="gap-2 shadow-md hover:shadow-lg transition-all" data-testid="button-edit-profile">
                  <Edit2 className="h-4 w-4" /> Edit Profile
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="border-none shadow-xl bg-card/95 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                  <div>
                    <CardTitle className="text-2xl font-heading">Edit Profile</CardTitle>
                    <CardDescription>Update your personal information and skills.</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} className="bg-background/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Software Engineer" {...field} className="bg-background/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" {...field} className="bg-background/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="City, Country" {...field} className="bg-background/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="profilePicture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Picture URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4 rounded-xl border p-5 bg-gradient-to-br from-primary/5 to-secondary/50">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            Bio
                            <Badge variant="outline" className="text-[10px] h-5 bg-background/50">AI Powered</Badge>
                          </Label>
                          <Button 
                            type="button" 
                            variant="default" 
                            size="sm" 
                            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-md"
                            onClick={generateAIBio}
                            disabled={isGeneratingBio}
                          >
                            {isGeneratingBio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            Generate with AI
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us about yourself..." 
                                  className="min-h-[120px] bg-background/80 border-primary/20 focus-visible:ring-purple-500"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills (comma separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="React, Node.js, Design..." {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4 pt-2">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          Social Links <span className="h-px flex-1 bg-border"></span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="github"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2"><Github className="h-3 w-3"/> GitHub</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://github.com/..." {...field} className="bg-background/50" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name="linkedin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2"><Linkedin className="h-3 w-3"/> LinkedIn</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://linkedin.com/in/..." {...field} className="bg-background/50" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name="twitter"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2"><Twitter className="h-3 w-3"/> Twitter</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://twitter.com/..." {...field} className="bg-background/50" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[120px]">
                          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              key="view-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Sidebar / Left Column */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="overflow-hidden border-none shadow-xl bg-card/95 backdrop-blur-sm sticky top-24">
                  <div className="h-32 bg-gradient-to-r from-primary via-purple-500 to-indigo-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                  </div>
                  <CardContent className="pt-0 relative">
                    <div className="flex flex-col items-center -mt-16 mb-4">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                          <AvatarImage src={profile.profilePicture} alt={profile.name} className="object-cover" />
                          <AvatarFallback className="text-4xl bg-muted">{profile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div className="text-center mt-4 space-y-1">
                        <h1 className="text-2xl font-bold font-heading">{profile.name}</h1>
                        <p className="text-primary font-medium">{profile.title}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 py-6 border-t border-dashed">
                      {profile.location && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-primary">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <span>{profile.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-primary">
                          <Mail className="h-4 w-4" />
                        </div>
                        <span className="break-all">{profile.email}</span>
                      </div>
                      {profile.website && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-primary">
                            <LinkIcon className="h-4 w-4" />
                          </div>
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline transition-colors">
                            {new URL(profile.website).hostname}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center gap-4 mt-2 pt-6 border-t">
                      {profile.socials.github && (
                        <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-secondary/50 hover:bg-primary hover:text-primary-foreground text-foreground transition-all hover:-translate-y-1">
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      {profile.socials.linkedin && (
                        <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-secondary/50 hover:bg-[#0077b5] hover:text-white text-foreground transition-all hover:-translate-y-1">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {profile.socials.twitter && (
                        <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-secondary/50 hover:bg-[#1DA1F2] hover:text-white text-foreground transition-all hover:-translate-y-1">
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <Button className="w-full gap-2" variant="outline" onClick={handleDownloadResume}>
                        <Download className="h-4 w-4" /> Download Resume
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Card Mobile */}
                <Card className="lg:hidden border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content / Right Column */}
              <div className="lg:col-span-8 space-y-6">
                {/* About Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="shadow-md border-none bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-heading flex items-center gap-2">
                        About Me
                        <div className="h-1 w-12 bg-primary rounded-full ml-2"></div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
                        {profile.bio}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Skills Section Desktop */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="shadow-md border-none bg-card/50 backdrop-blur-sm hidden lg:block">
                    <CardHeader>
                      <CardTitle className="text-xl font-heading flex items-center gap-2">
                        Skills & Expertise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge 
                              variant="secondary" 
                              className="px-4 py-1.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-default border border-transparent hover:border-primary/20"
                            >
                              {skill}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Recent Activity / Projects */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="shadow-md border-none bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-heading flex items-center gap-2">
                        Featured Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {[1, 2].map((i) => (
                          <motion.div 
                            key={i} 
                            whileHover={{ y: -2 }}
                            className="group flex flex-col md:flex-row gap-5 p-4 rounded-xl hover:bg-secondary/30 transition-all border border-transparent hover:border-border/50 shadow-sm hover:shadow-md bg-card"
                          >
                            <div className="w-full md:w-56 h-36 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                              <img 
                                src={`https://images.unsplash.com/photo-${i === 1 ? '1498050108023-c5249f4df085' : '1461749280684-dccba630e2f6'}?w=400&h=300&fit=crop`} 
                                alt="Project thumbnail" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg font-heading group-hover:text-primary transition-colors">
                                  {i === 1 ? "E-Commerce Dashboard" : "Task Management App"}
                                </h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <LinkIcon className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {i === 1 
                                  ? "A comprehensive analytics dashboard for online retailers featuring real-time data visualization, inventory management, and automated reporting systems." 
                                  : "A collaborative task manager with real-time updates, team workspaces, and intuitive drag-and-drop interface designed for agile teams."}
                              </p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                <Badge variant="outline" className="text-xs bg-background/50">React</Badge>
                                <Badge variant="outline" className="text-xs bg-background/50">Tailwind</Badge>
                                {i === 1 ? <Badge variant="outline" className="text-xs bg-background/50">Recharts</Badge> : <Badge variant="outline" className="text-xs bg-background/50">DnD</Badge>}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
