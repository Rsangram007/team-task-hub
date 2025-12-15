import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.15),transparent_50%)]" />
      <div className="text-center relative z-10 animate-fade-in">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <CheckSquare className="w-8 h-8 text-primary" />
        </div>
        <h1 className="mb-4 text-4xl font-bold">TaskFlow</h1>
        <p className="text-xl text-muted-foreground mb-8">Collaborative Task Management</p>
        <Button size="lg" onClick={() => navigate('/auth')}>Get Started</Button>
      </div>
    </div>
  );
};

export default Index;
