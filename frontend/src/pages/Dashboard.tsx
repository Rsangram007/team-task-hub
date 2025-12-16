import { useState } from "react";
import {
  Plus,
  LayoutDashboard,
  ListTodo,
  Clock,
  User,
  Bell,
  LogOut,
  CheckSquare,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useTasks, useDeleteTask } from "@/hooks/useTasks";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
} from "@/hooks/useNotifications";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { TaskFiltersBar } from "@/components/tasks/TaskFiltersBar";
import { StatsSkeleton } from "@/components/tasks/TaskSkeleton";
import { Task, TaskFilters, TaskSort } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const { user, signOut, updateProfile } = useAuth();
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sort, setSort] = useState<TaskSort>({
    field: "created_at",
    direction: "desc",
  });
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  // State for profile update form
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");

  const { data: allTasks = [], isLoading } = useTasks(filters, sort);
  const { data: notifications = [] } = useNotifications();
  const unreadCount = useUnreadNotificationsCount();
  const markRead = useMarkNotificationRead();
  const deleteTask = useDeleteTask();

  const myTasks = allTasks.filter((t) => t.assigned_to_id === user?.id);
  const createdTasks = allTasks.filter((t) => t.creator_id === user?.id);
  const overdueTasks = allTasks.filter(
    (t) =>
      t.due_date &&
      new Date(t.due_date) < new Date() &&
      t.status !== "completed"
  );

  const stats = [
    { label: "Total Tasks", value: allTasks.length, icon: ListTodo },
    { label: "Assigned to Me", value: myTasks.length, icon: User },
    { label: "Overdue", value: overdueTasks.length, icon: Clock },
    {
      label: "Completed",
      value: allTasks.filter((t) => t.status === "completed").length,
      icon: CheckSquare,
    },
  ];

  const getDisplayedTasks = () => {
    switch (activeTab) {
      case "mine":
        return myTasks;
      case "created":
        return createdTasks;
      case "overdue":
        return overdueTasks;
      default:
        return allTasks;
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };
  const handleDelete = (id: string) => deleteTask.mutate(id);
  const handleCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };
  const handleAvatarUpload = async (url: string) => {
    await updateProfile({ avatarUrl: url });
  };

  // Handle profile update submission
  const handleProfileUpdate = async () => {
    try {
      await updateProfile({ fullName, email });
      // Close the dialog after successful update
      setProfileDialogOpen(false);
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.1),transparent_50%)] pointer-events-none' />

      {/* Header */}
      <header className='sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl'>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
              <CheckSquare className='w-4 h-4 text-primary' />
            </div>
            <span className='font-semibold text-lg'>TaskFlow</span>
          </div>
          <div className='flex items-center gap-3'>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='ghost' size='icon' className='relative'>
                  <Bell className='h-5 w-5' />
                  {unreadCount > 0 && (
                    <Badge className='absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs'>
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-80' align='end'>
                <h4 className='font-medium mb-2'>Notifications</h4>
                <ScrollArea className='h-64'>
                  {notifications.length === 0 ? (
                    <p className='text-sm text-muted-foreground text-center py-4'>
                      No notifications
                    </p>
                  ) : (
                    <div className='space-y-2'>
                      {notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`p-2 rounded-lg text-sm ${
                            n.read ? "opacity-60" : "bg-muted"
                          }`}
                          onClick={() => !n.read && markRead.mutate(n.id)}
                        >
                          <p className='font-medium'>{n.title}</p>
                          <p className='text-muted-foreground text-xs'>
                            {n.message}
                          </p>
                          <p className='text-muted-foreground text-xs mt-1'>
                            {format(new Date(n.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <ThemeToggle />
            <Dialog
              open={profileDialogOpen}
              onOpenChange={(open) => {
                setProfileDialogOpen(open);
                // Reset form fields when dialog opens
                if (open) {
                  setFullName(user?.fullName || "");
                  setEmail(user?.email || "");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <Settings className='h-5 w-5' />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Profile Settings</DialogTitle>
                  <DialogDescription>
                    Manage your profile information and avatar
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-6 py-4'>
                  <div className='flex flex-col items-center gap-4'>
                    <ProfileImageUpload
                      avatarUrl={user?.avatarUrl || null}
                      fullName={user?.fullName || null}
                      onUploadComplete={handleAvatarUpload}
                    />
                    <p className='text-sm text-muted-foreground'>
                      Click the camera to upload a new photo
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='fullName'>Full Name</Label>
                    <Input
                      id='fullName'
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className='flex justify-end gap-3'>
                    <Button
                      variant='outline'
                      onClick={() => setProfileDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleProfileUpdate}>Save Changes</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className='flex items-center gap-2'>
              <Avatar className='h-8 w-8 border border-border'>
                <AvatarImage
                  src={user?.avatarUrl || undefined}
                  alt={user?.fullName || "Profile"}
                />
                <AvatarFallback className='text-xs bg-primary/10 text-primary'>
                  {user?.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className='text-sm text-muted-foreground hidden sm:block'>
                {user?.fullName || user?.email}
              </span>
            </div>
            <Button variant='ghost' size='icon' onClick={signOut}>
              <LogOut className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-8 relative z-10'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
          <div>
            <h1 className='text-2xl font-bold'>Dashboard</h1>
            <p className='text-muted-foreground'>
              Manage your tasks and collaborate with your team
            </p>
          </div>
          <Button onClick={handleCreate} className='gap-2'>
            <Plus className='h-4 w-4' />
            New Task
          </Button>
        </div>

        {/* Stats */}
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className='p-4 rounded-lg border border-border bg-card'
              >
                <div className='flex items-center gap-3'>
                  <stat.icon className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <p className='text-2xl font-bold'>{stat.value}</p>
                    <p className='text-sm text-muted-foreground'>
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Task Filters and Tabs */}
        <div className='mb-6'>
          <TaskFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='mb-4'>
            <TabsTrigger value='all' className='gap-2'>
              <LayoutDashboard className='h-4 w-4' />
              All Tasks
            </TabsTrigger>
            <TabsTrigger value='mine' className='gap-2'>
              <User className='h-4 w-4' />
              Assigned to Me
            </TabsTrigger>
            <TabsTrigger value='created' className='gap-2'>
              <CheckSquare className='h-4 w-4' />
              Created by Me
            </TabsTrigger>
            <TabsTrigger value='overdue' className='gap-2'>
              <Clock className='h-4 w-4' />
              Overdue
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className='mt-0'>
            <TaskList
              tasks={getDisplayedTasks()}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Task Form Dialog */}
        <TaskFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={editingTask}
        />
      </main>
    </div>
  );
}
