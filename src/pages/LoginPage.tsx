import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Mail, MapPin, Sparkles, ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check if user is admin
      const { data: adminData } = await supabase.from("admins").select("*").eq("user_id", data.user.id).maybeSingle();
      
      if (!adminData) {
        await supabase.auth.signOut();
        throw new Error("Nuk jeni i autorizuar si administrator");
      }

      toast.success("Mirësevini në panelin e administratorit!");
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="stars-bg" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in">
          <Link to="/" className="inline-block group">
            <div className="w-20 h-20 mx-auto mb-4 hero-gradient rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300 animate-pulse-glow">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="font-cosmic text-2xl font-bold text-gradient mb-2">CODE4COMMUNITY</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Admin Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="glass-card-strong rounded-3xl p-8 space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Mirësevini</h2>
            <p className="text-sm text-muted-foreground mt-1">Hyni në panelin e administratorit</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Email
            </Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="admin@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Fjalëkalimi
            </Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>
          
          <Button type="submit" variant="hero" className="w-full h-12 group" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Duke hyrë...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Hyr në Panel
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <p className="text-center mt-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            Kthehu në faqen kryesore
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;