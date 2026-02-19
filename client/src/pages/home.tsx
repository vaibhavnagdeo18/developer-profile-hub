import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Project, Profile } from "@shared/schema";
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
  Download,
  Plus,
  Trash2,
  Pencil
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
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

// Validation Schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  location: z.string().optional(),
  email: z.string().email("Invalid email address"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  profilePicture: z.string().optional().or(z.literal("")),
  skills: z.string(), // We'll parse this from comma-separated string
  github: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().url("Invalid Image URL"),
  tech: z.array(z.string()),
});

const projectFormSchema = projectSchema.extend({
  tech: z.string().min(1, "At least one technology is required"),
});

const BIO_TEMPLATES = [
  "As a {title}, I specialize in {skills}. I am dedicated to building robust and scalable solutions that solve complex business challenges.",
  "Innovative {title} with expertise in {skills}. I love turning complex problems into simple, beautiful, and intuitive designs.",
  "Results-driven {title} focused on {skills}. I bring a creative approach to problem-solving and a commitment to code quality."
];

export default function Home() {
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Fetch Profile
  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  // Fetch Projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest("PUT", "/api/profile", values);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/profile"], data);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile changes have been saved successfully.",
      });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest("POST", "/api/projects", values);
      return res.json();
    },
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ["/api/projects"] });
      const previousProjects = queryClient.getQueryData<Project[]>(["/api/projects"]);
      queryClient.setQueryData(["/api/projects"], (old: Project[] | undefined) => [
        ...(old || []),
        { ...newProject, id: "temp-" + Date.now() }
      ]);
      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      queryClient.setQueryData(["/api/projects"], context?.previousProjects);
      toast({
        title: "Create Failed",
        description: "Could not add the project. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onSuccess: () => {
      toast({ title: "Project Added", description: "Project has been successfully created." });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const res = await apiRequest("PUT", `/api/projects/${id}`, values);
      return res.json();
    },
    onMutate: async ({ id, values }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/projects"] });
      const previousProjects = queryClient.getQueryData<Project[]>(["/api/projects"]);
      queryClient.setQueryData(["/api/projects"], (old: Project[] | undefined) =>
        old?.map(p => p.id === id ? { ...p, ...values } : p)
      );
      return { previousProjects };
    },
    onError: (err, { id, values }, context) => {
      queryClient.setQueryData(["/api/projects"], context?.previousProjects);
      toast({
        title: "Update Failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onSuccess: () => {
      toast({ title: "Project Updated", description: "Project has been successfully updated." });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["/api/projects"] });
      const previousProjects = queryClient.getQueryData<Project[]>(["/api/projects"]);
      queryClient.setQueryData(["/api/projects"], (old: Project[] | undefined) =>
        old?.filter(p => p.id !== id)
      );
      return { previousProjects };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["/api/projects"], context?.previousProjects);
      toast({
        title: "Delete Failed",
        description: "Could not remove the project. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onSuccess: () => {
      toast({ title: "Project Deleted", description: "Project has been removed." });
    },
  });

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.name}'s Profile`,
          text: `Check out ${profile?.name}'s professional profile!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Profile link has been copied to your clipboard.",
        });
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Error sharing:", err);
      }
    }
  };

  // Effect to initialize theme
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
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
  };

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      title: profile?.title || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      email: profile?.email || "",
      website: profile?.website || "",
      profilePicture: profile?.profilePicture || "",
      skills: profile?.skills.join(", ") || "",
      github: profile?.socials.github || "",
      linkedin: profile?.socials.linkedin || "",
      twitter: profile?.socials.twitter || "",
    },
  });

  useEffect(() => {
    if (isEditing && profile) {
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
    const formattedValues = {
      ...values,
      skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
      socials: {
        github: values.github || "",
        linkedin: values.linkedin || "",
        twitter: values.twitter || "",
      }
    };
    updateProfileMutation.mutate(formattedValues);
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

    try {
      const res = await apiRequest("POST", "/api/generate-bio", {
        skills: currentSkills.split(",").map(s => s.trim()).filter(Boolean),
        title: currentTitle
      });
      const data = await res.json();
      form.setValue("bio", data.bio);
      toast({
        title: "Bio Generated",
        description: "A new professional bio has been created for you.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to generate bio.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingBio(false);
    }
  };

  if (profileLoading || projectsLoading || !profile || !projects) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                <Button variant="outline" size="sm" onClick={handleShare} className="flex gap-2">
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
                            <FormLabel>Profile Picture</FormLabel>
                            <FormControl>
                              <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                  <Avatar className="w-16 h-16 border-2 border-primary/20 shadow-sm">
                                    <AvatarImage src={field.value} className="object-cover" />
                                    <AvatarFallback className="text-xl">{form.getValues("name")?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 space-y-1">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      className="bg-background/50 cursor-pointer text-xs"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          if (file.size > 2 * 1024 * 1024) {
                                            toast({
                                              title: "File too large",
                                              description: "Please select an image smaller than 2MB.",
                                              variant: "destructive"
                                            });
                                            return;
                                          }
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            field.onChange(reader.result as string);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                      Max 2MB. Supports JPG, PNG, WebP.
                                    </p>
                                  </div>
                                </div>
                                {field.value && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-7 w-fit text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => field.onChange("")}
                                  >
                                    Remove Photo
                                  </Button>
                                )}
                              </div>
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
                                <FormLabel className="flex items-center gap-2"><Github className="h-3 w-3" /> GitHub</FormLabel>
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
                                <FormLabel className="flex items-center gap-2"><Linkedin className="h-3 w-3" /> LinkedIn</FormLabel>
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
                                <FormLabel className="flex items-center gap-2"><Twitter className="h-3 w-3" /> Twitter</FormLabel>
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
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8 space-y-6">
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

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="shadow-md border-none bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl font-heading flex items-center gap-2">
                        Featured Projects
                        <div className="h-1 w-12 bg-primary rounded-full ml-2"></div>
                      </CardTitle>
                      {!isEditing && (
                        <ProjectDialog
                          onSubmit={(values) => createProjectMutation.mutate(values)}
                          isLoading={createProjectMutation.isPending}
                        >
                          <Button size="sm" variant="outline" className="gap-2 border-primary/20 hover:border-primary/50 text-xs sm:text-sm">
                            <Plus className="h-4 w-4" /> Add Project
                          </Button>
                        </ProjectDialog>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-6">
                        {projects.map((project) => (
                          <motion.div
                            key={project.id}
                            whileHover={{ y: -4 }}
                            className="group flex flex-col md:flex-row gap-5 p-5 rounded-2xl hover:bg-gradient-to-br hover:from-primary/5 hover:to-secondary/5 transition-all border border-transparent hover:border-border/50 shadow-sm hover:shadow-xl bg-card"
                          >
                            <div className="w-full md:w-56 h-40 bg-muted rounded-xl overflow-hidden flex-shrink-0 relative shadow-inner">
                              <img
                                src={`${project.image}?w=400&h=300&fit=crop`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                alt={project.title}
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-xl font-heading group-hover:text-primary transition-colors">
                                  {project.title}
                                </h3>
                                {!isEditing && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <ProjectDialog
                                      project={project}
                                      onSubmit={(values) => updateProjectMutation.mutate({ id: project.id, values })}
                                      isLoading={updateProjectMutation.isPending}
                                    >
                                      <Button variant="secondary" size="icon" className="h-9 w-9 bg-background/50 backdrop-blur-sm border shadow-sm">
                                        <Pencil className="h-4 w-4 text-primary" />
                                      </Button>
                                    </ProjectDialog>
                                    <Button
                                      variant="secondary"
                                      size="icon"
                                      className="h-9 w-9 bg-background/50 backdrop-blur-sm border shadow-sm hover:text-destructive"
                                      onClick={() => {
                                        if (confirm("Are you sure you want to delete this project?")) {
                                          deleteProjectMutation.mutate(project.id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-10">
                                {project.description}
                              </p>
                              <div className="flex flex-wrap gap-2 pt-2">
                                {project.tech.map((tech, index) => (
                                  <Badge key={index} variant="secondary" className="text-[10px] sm:text-xs font-normal bg-primary/10 text-primary border-none shadow-sm px-3">
                                    {tech}
                                  </Badge>
                                ))}
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

function ProjectDialog({
  children,
  project,
  onSubmit,
  isLoading
}: {
  children: React.ReactNode;
  project?: Project;
  onSubmit: (values: any) => void;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      image: project?.image || "",
      tech: project?.tech.join(", ") || "",
    },
  });

  const onFormSubmit = (values: any) => {
    onSubmit({
      ...values,
      tech: values.tech.split(",").map((s: string) => s.trim()).filter(Boolean)
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{project ? "Edit Project" : "Add New Project"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Awesome Project" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe your masterpiece..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl><Input placeholder="https://images.unsplash.com/..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tech"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stack (comma separated)</FormLabel>
                  <FormControl><Input placeholder="React, Node.js, etc." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-6">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {project ? "Save Changes" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}