import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";
import FeedbackForm from "@/components/FeedbackForm";
import DataExport from "@/components/DataExport";
import { supabase } from "@/integrations/supabase/client";
import { Report } from "@/types/report";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, MapPin, Calendar, Clock, Download } from "lucide-react";
import { format } from "date-fns";
import { sq } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TrackPage = () => {
  const { t } = useLanguage();
  const [searchCode, setSearchCode] = useState("");
  const [searchedReport, setSearchedReport] = useState<Report | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchAllReports();
    const channel = supabase
      .channel("reports-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => fetchAllReports())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAllReports = async () => {
    // Use public function to get only non-sensitive data
    const { data } = await supabase.rpc("get_public_reports");
    if (data) {
      const sorted = [...data].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 20);
      setAllReports(sorted as Report[]);
    }
  };

  const handleSearch = async () => {
    if (!searchCode.trim()) return;
    setIsSearching(true);
    setNotFound(false);
    // Use public function for search
    const { data } = await supabase
      .rpc("get_public_reports")
      .eq("tracking_code", searchCode.trim().toUpperCase())
      .maybeSingle();
    setSearchedReport(data as Report | null);
    setNotFound(!data);
    setIsSearching(false);
  };

  const ReportCard = ({ report }: { report: Report }) => (
    <article className="glass-card rounded-xl p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold line-clamp-1">{report.title}</h3>
        <StatusBadge status={report.status} />
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{report.description}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(report.created_at), "dd MMM yyyy", { locale: sq })}</span>
        {report.neighborhood && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{report.neighborhood}</span>}
      </div>
    </article>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-grow pt-24 pb-16" role="main">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">{t("track.title")}</h1>
            <p className="text-muted-foreground">{t("track.subtitle")}</p>
          </div>

          <Tabs defaultValue="search" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Kërko Raportim
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Eksporto të Dhënat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-8">
              {/* Search Box */}
              <div className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <Input 
                    placeholder={t("track.placeholder")} 
                    value={searchCode} 
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())} 
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()} 
                    className="font-mono text-lg tracking-wider"
                    aria-label="Tracking code"
                  />
                  <Button onClick={handleSearch} disabled={isSearching} aria-label="Search">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Searched Report */}
              {searchedReport && (
                <div className="max-w-2xl mx-auto animate-fade-in">
                  <h2 className="font-display font-semibold text-xl mb-4">Raportimi Juaj</h2>
                  <article className="glass-card-strong rounded-xl p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Kodi: <span className="font-mono font-bold text-primary">{searchedReport.tracking_code}</span></p>
                        <h3 className="font-display text-xl font-bold">{searchedReport.title}</h3>
                      </div>
                      <StatusBadge status={searchedReport.status} />
                    </div>
                    <p className="text-muted-foreground mb-4">{searchedReport.description}</p>
                    {searchedReport.photo_url && <img src={searchedReport.photo_url} alt="Report photo" className="w-full h-48 object-cover rounded-lg mb-4" />}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{format(new Date(searchedReport.created_at), "dd MMMM yyyy, HH:mm", { locale: sq })}</span>
                      {searchedReport.neighborhood && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{searchedReport.neighborhood}</span>}
                    </div>
                    
                    {/* Feedback Form - only show for resolved reports */}
                    {searchedReport.status === "perfunduar" && (
                      <FeedbackForm 
                        reportId={searchedReport.id} 
                        trackingCode={searchedReport.tracking_code} 
                      />
                    )}
                  </article>
                </div>
              )}

              {notFound && (
                <div className="max-w-md mx-auto text-center p-6 bg-destructive/10 rounded-xl" role="alert">
                  <p className="text-destructive">{t("track.notfound")}</p>
                </div>
              )}

              {/* All Reports */}
              <section aria-labelledby="recent-reports">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 id="recent-reports" className="font-display font-semibold text-xl">{t("track.recent")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allReports.map((report) => <ReportCard key={report.id} report={report} />)}
                </div>
                {allReports.length === 0 && <p className="text-center text-muted-foreground py-12">Nuk ka raportim akoma.</p>}
              </section>
            </TabsContent>

            <TabsContent value="export">
              <div className="max-w-lg mx-auto glass-card-strong rounded-xl p-6">
                <DataExport />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackPage;
