import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, FileText, Search, Shield, CheckCircle, Clock, AlertCircle, Sparkles, Rocket, Globe, Users, ArrowRight, Zap } from "lucide-react";

const Index = () => {
  const [stats, setStats] = useState({ total: 0, new: 0, process: 0, done: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Use public function to get only non-sensitive data
    const { data } = await supabase.rpc("get_public_reports");
    if (data) {
      setStats({
        total: data.length,
        new: data.filter((r: any) => r.status === 'i_ri').length,
        process: data.filter((r: any) => r.status === 'ne_proces').length,
        done: data.filter((r: any) => r.status === 'perfunduar').length,
      });
    }
  };

  const features = [
    { icon: FileText, title: "Raporto Lehtë", desc: "Pa regjistrimi, pa login - raporto menjëherë", delay: 0 },
    { icon: MapPin, title: "Geolokacion", desc: "Vendndodhje e saktë me hartë interaktive", delay: 0.1 },
    { icon: Search, title: "Ndiq Statusin", desc: "Kërko raportimin me kodin tuaj unik", delay: 0.2 },
    { icon: Shield, title: "Transparencë", desc: "Shiko të gjitha raportimet në kohë reale", delay: 0.3 },
  ];

  const statsData = [
    { icon: AlertCircle, value: stats.new, label: "Raporte të Reja", color: "text-primary", bgColor: "from-primary/20 to-primary/5" },
    { icon: Clock, value: stats.process, label: "Në Proces", color: "text-warning", bgColor: "from-warning/20 to-warning/5" },
    { icon: CheckCircle, value: stats.done, label: "Të Zgjidhura", color: "text-success", bgColor: "from-success/20 to-success/5" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Cosmic Background Effects */}
      <div className="stars-bg" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>
      
      <Header />
      
      {/* Hero Section */}
      <section className="pt-28 lg:pt-40 pb-20 lg:pb-32 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-primary animate-fade-in">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">Elbasan, Shqipëri</span>
              <Globe className="w-4 h-4" />
            </div>
            
            {/* Title */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight">
                <span className="text-gradient font-cosmic tracking-wider">CODE4COMMUNITY</span>
              </h1>
              <p className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground/90">
                Zëri Yt për Lagjen Tënde
              </p>
            </div>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.3s" }}>
              Raportoni problemet në lagje - mungesa ndriçimi, gropa, mbeturina, infrastrukturë. 
              <span className="text-primary font-medium"> Së bashku ndërtojmë një qytet më të mirë!</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fade-in" style={{ animationDelay: "0.45s" }}>
              <Link to="/report">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  <Rocket className="w-5 h-5 group-hover:animate-pulse" />
                  Raporto Problemin
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/track">
                <Button variant="glass" size="xl" className="w-full sm:w-auto group border-primary/30">
                  <Search className="w-5 h-5" />
                  Kërko Raportim
                </Button>
              </Link>
            </div>
            
            {/* Floating Elements */}
            <div className="hidden lg:block">
              <div className="absolute top-32 left-10 w-20 h-20 glass-card rounded-2xl flex items-center justify-center animate-float">
                <Zap className="w-10 h-10 text-warning" />
              </div>
              <div className="absolute top-48 right-16 w-16 h-16 glass-card rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
                <Users className="w-8 h-8 text-accent" />
              </div>
              <div className="absolute bottom-32 left-20 w-14 h-14 glass-card rounded-lg flex items-center justify-center animate-float" style={{ animationDelay: "2s" }}>
                <Shield className="w-7 h-7 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {statsData.map((stat, i) => (
              <div 
                key={i} 
                className="glass-card-strong rounded-2xl p-8 text-center hover-lift perspective-1000 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className={`text-4xl md:text-5xl font-bold font-display ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <span className="inline-block px-4 py-1.5 rounded-full glass-card text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 inline mr-2" />
              Funksionet
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
              Si <span className="text-gradient">Funksionon?</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="glass-card-strong rounded-2xl p-8 text-center hover-lift perspective-1000 animate-fade-in group"
                style={{ animationDelay: `${feature.delay}s` }}
              >
                <div className="w-20 h-20 mx-auto mb-6 hero-gradient rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="glass-card-strong rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 hero-gradient opacity-10" />
            
            <div className="relative z-10 space-y-8">
              <div className="w-24 h-24 mx-auto hero-gradient rounded-3xl flex items-center justify-center shadow-xl animate-pulse-glow">
                <MapPin className="w-12 h-12 text-primary-foreground" />
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Bëhu Pjesë e <span className="text-gradient">Ndryshimit</span>
              </h2>
              
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Bashkohu me qytetarët e tjerë për të raportuar dhe zgjidhur problemet në lagjen tënde
              </p>
              
              <Link to="/report">
                <Button variant="hero" size="xl" className="group">
                  <Rocket className="w-5 h-5" />
                  Fillo Tani
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="flex-grow" />
      <Footer />
    </div>
  );
};

export default Index;