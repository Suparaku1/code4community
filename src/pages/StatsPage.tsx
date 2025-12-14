import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Report } from "@/types/report";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { FileText, CheckCircle, Clock, TrendingUp, MapPin, Users, Star, Shield, Globe, Award } from "lucide-react";
import { format, subDays, differenceInHours } from "date-fns";
import { sq } from "date-fns/locale";

const StatsPage = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    if (data) setReports(data as Report[]);
    setIsLoading(false);
  };

  // Calculate statistics
  const stats = {
    total: reports.length,
    new: reports.filter((r) => r.status === "i_ri").length,
    inProcess: reports.filter((r) => r.status === "ne_proces").length,
    resolved: reports.filter((r) => r.status === "perfunduar").length,
    withLocation: reports.filter((r) => r.has_location).length,
    withPhoto: reports.filter((r) => r.photo_url).length,
  };

  // Resolution rate
  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  // Average resolution time (mock calculation based on created/updated)
  const resolvedReports = reports.filter((r) => r.status === "perfunduar");
  const avgResolutionHours = resolvedReports.length > 0
    ? Math.round(
        resolvedReports.reduce((acc, r) => {
          const hours = differenceInHours(new Date(r.updated_at), new Date(r.created_at));
          return acc + hours;
        }, 0) / resolvedReports.length
      )
    : 0;

  // Reports by neighborhood
  const byNeighborhood = reports.reduce((acc, r) => {
    const hood = r.neighborhood || "Pa lagje";
    acc[hood] = (acc[hood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const neighborhoodData = Object.entries(byNeighborhood)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Status distribution
  const statusData = [
    { name: t("status.new"), value: stats.new, color: "#6366f1" },
    { name: t("status.inprocess"), value: stats.inProcess, color: "#f59e0b" },
    { name: t("status.done"), value: stats.resolved, color: "#10b981" },
  ];

  // Reports over time (last 14 days)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const count = reports.filter((r) => format(new Date(r.created_at), "yyyy-MM-dd") === dateStr).length;
    return {
      date: format(date, "dd MMM", { locale: sq }),
      count,
    };
  });

  // Get feedback stats from localStorage
  const feedbacks = JSON.parse(localStorage.getItem("report-feedbacks") || "{}");
  const feedbackValues = Object.values(feedbacks) as Array<{ rating: number }>;
  const avgRating = feedbackValues.length > 0
    ? (feedbackValues.reduce((acc, f) => acc + f.rating, 0) / feedbackValues.length).toFixed(1)
    : "N/A";

  const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm mb-4">
              <Globe className="w-4 h-4" />
              <span>EU Transparency Standards</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-gradient">
              {t("stats.title")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("stats.subtitle")}
            </p>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card-strong rounded-2xl p-6 text-center">
              <FileText className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-4xl font-bold mb-1">{stats.total}</p>
              <p className="text-sm text-muted-foreground">{t("stats.total")}</p>
            </div>
            <div className="glass-card-strong rounded-2xl p-6 text-center">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
              <p className="text-4xl font-bold text-success mb-1">{resolutionRate}%</p>
              <p className="text-sm text-muted-foreground">{t("stats.resolved")}</p>
            </div>
            <div className="glass-card-strong rounded-2xl p-6 text-center">
              <Clock className="w-8 h-8 text-warning mx-auto mb-3" />
              <p className="text-4xl font-bold text-warning mb-1">{avgResolutionHours}h</p>
              <p className="text-sm text-muted-foreground">{t("stats.avgtime")}</p>
            </div>
            <div className="glass-card-strong rounded-2xl p-6 text-center">
              <Star className="w-8 h-8 text-warning mx-auto mb-3" />
              <p className="text-4xl font-bold mb-1">{avgRating}</p>
              <p className="text-sm text-muted-foreground">{t("stats.satisfaction")}</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Reports Over Time */}
            <div className="glass-card-strong rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Raportime sipas Ditëve (14 ditë)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={last14Days}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 10, 20, 0.9)",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution */}
            <div className="glass-card-strong rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Shpërndarja sipas Statusit
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 10, 20, 0.9)",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {statusData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Neighborhood Chart */}
          <div className="glass-card-strong rounded-2xl p-6 mb-8">
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Raportime sipas Lagjeve
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={neighborhoodData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#888" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 10, 20, 0.9)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* EU Compliance Badge */}
          <div className="glass-card-strong rounded-2xl p-8 text-center">
            <div className="flex justify-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-success" />
              </div>
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
                <Globe className="w-8 h-8 text-warning" />
              </div>
            </div>
            <h3 className="font-display text-xl font-bold mb-2">EU Standards Compliant</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Kjo platformë respekton standardet europiane për transparencë, privatësi (GDPR), dhe aksesibilitet (WCAG 2.1 AA).
            </p>
            <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>🔒 GDPR</span>
              <span>♿ WCAG 2.1</span>
              <span>🌍 Multi-language</span>
              <span>📊 Open Data</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StatsPage;
