import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Report } from "@/types/report";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { LogOut, LayoutDashboard, FileText, Users, Search, Filter, Eye, Check, Clock, AlertCircle, MapPin, Camera, DollarSign, UserPlus, Trash2, Edit, X, Shield, Mail, Sparkles, Map } from "lucide-react";
import ReportsMap from "@/components/ReportsMap";
import { format } from "date-fns";
import { sq } from "date-fns/locale";

interface Admin {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  is_super_admin: boolean;
  created_at: string;
}

const DAMAGE_COSTS: Record<string, { min: number; max: number; label: string }> = {
  "Ndriçim": { min: 5000, max: 25000, label: "Riparim ndriçimi" },
  "Rrugë": { min: 50000, max: 500000, label: "Riparim rruge" },
  "Mbeturina": { min: 2000, max: 10000, label: "Pastrim mbeturinash" },
  "Gjelbërim": { min: 3000, max: 20000, label: "Mirëmbajtje gjelbërimi" },
  "Infrastrukturë": { min: 20000, max: 200000, label: "Riparim infrastrukture" },
  "Tjetër": { min: 5000, max: 50000, label: "Riparime të tjera" },
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [hasPhotoFilter, setHasPhotoFilter] = useState(false);
  const [hasLocationFilter, setHasLocationFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reports" | "admins" | "finance" | "map">("reports");
  
  // Admin management
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showEditAdmin, setShowEditAdmin] = useState<Admin | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminSuper, setNewAdminSuper] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchReports();
    fetchAdmins();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/login"); return; }
    const { data: admin } = await supabase.from("admins").select("*").eq("user_id", session.user.id).maybeSingle();
    if (!admin) { await supabase.auth.signOut(); navigate("/login"); return; }
    setCurrentAdmin(admin as Admin);
  };

  const fetchReports = async () => {
    const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    if (data) setReports(data as Report[]);
    setIsLoading(false);
  };

  const fetchAdmins = async () => {
    const { data } = await supabase.from("admins").select("*").order("created_at", { ascending: false });
    if (data) setAdmins(data as Admin[]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const updateStatus = async (reportId: string, status: 'i_ri' | 'ne_proces' | 'perfunduar') => {
    const updateData: any = { status };
    if (status === 'perfunduar' && adminNote.trim()) updateData.admin_note = adminNote.trim();
    const { error } = await supabase.from("reports").update(updateData).eq("id", reportId);
    if (error) { toast.error("Gabim: " + error.message); return; }
    toast.success("Statusi u përditësua!");
    fetchReports();
    setSelectedReport(null);
    setAdminNote("");
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm("Jeni të sigurt që doni të fshini këtë raport?")) return;
    const { error } = await supabase.from("reports").delete().eq("id", reportId);
    if (error) { toast.error("Gabim: " + error.message); return; }
    toast.success("Raporti u fshi!");
    fetchReports();
    setSelectedReport(null);
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) { toast.error("Email kërkohet"); return; }
    const { error } = await supabase.from("admins").insert([{
      email: newAdminEmail.trim(),
      full_name: newAdminName.trim() || null,
      is_super_admin: newAdminSuper,
      user_id: crypto.randomUUID() // Placeholder until they sign up
    }]);
    if (error) { toast.error("Gabim: " + error.message); return; }
    toast.success("Admini u shtua!");
    setShowAddAdmin(false);
    setNewAdminEmail("");
    setNewAdminName("");
    setNewAdminSuper(false);
    fetchAdmins();
  };

  const updateAdmin = async () => {
    if (!showEditAdmin) return;
    const { error } = await supabase.from("admins").update({
      full_name: newAdminName.trim() || null,
      is_super_admin: newAdminSuper
    }).eq("id", showEditAdmin.id);
    if (error) { toast.error("Gabim: " + error.message); return; }
    toast.success("Admini u përditësua!");
    setShowEditAdmin(null);
    fetchAdmins();
  };

  const deleteAdmin = async (adminId: string) => {
    if (!confirm("Jeni të sigurt që doni të fshini këtë admin?")) return;
    const { error } = await supabase.from("admins").delete().eq("id", adminId);
    if (error) { toast.error("Gabim: " + error.message); return; }
    toast.success("Admini u fshi!");
    fetchAdmins();
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchTerm && !r.title.toLowerCase().includes(searchTerm.toLowerCase()) && !r.tracking_code.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (hasPhotoFilter && !r.photo_url) return false;
    if (hasLocationFilter && !r.has_location) return false;
    return true;
  });

  const stats = {
    total: reports.length,
    new: reports.filter(r => r.status === 'i_ri').length,
    process: reports.filter(r => r.status === 'ne_proces').length,
    done: reports.filter(r => r.status === 'perfunduar').length,
    withPhoto: reports.filter(r => r.photo_url).length,
    withLocation: reports.filter(r => r.has_location).length,
  };

  const calculateFinancials = () => {
    let totalMin = 0, totalMax = 0;
    const byCategory: Record<string, { count: number; min: number; max: number }> = {};
    
    reports.filter(r => r.status !== 'perfunduar').forEach(r => {
      const category = Object.keys(DAMAGE_COSTS).find(k => r.title.toLowerCase().includes(k.toLowerCase())) || "Tjetër";
      const costs = DAMAGE_COSTS[category];
      totalMin += costs.min;
      totalMax += costs.max;
      
      if (!byCategory[category]) byCategory[category] = { count: 0, min: 0, max: 0 };
      byCategory[category].count++;
      byCategory[category].min += costs.min;
      byCategory[category].max += costs.max;
    });
    
    return { totalMin, totalMax, byCategory };
  };

  const financials = calculateFinancials();

  return (
    <div className="min-h-screen relative">
      <div className="stars-bg" />
      
      {/* Header */}
      <header className="glass-card-strong sticky top-0 z-50 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 hero-gradient rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-cosmic text-lg font-bold text-gradient">ADMIN DASHBOARD</h1>
            <p className="text-xs text-muted-foreground">{currentAdmin?.email}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Dil</Button>
      </header>

      <div className="p-6 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="glass-card rounded-xl p-4"><FileText className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></div>
          <div className="glass-card rounded-xl p-4"><AlertCircle className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold text-primary">{stats.new}</p><p className="text-xs text-muted-foreground">Të Reja</p></div>
          <div className="glass-card rounded-xl p-4"><Clock className="w-5 h-5 text-warning mb-2" /><p className="text-2xl font-bold text-warning">{stats.process}</p><p className="text-xs text-muted-foreground">Në Proces</p></div>
          <div className="glass-card rounded-xl p-4"><Check className="w-5 h-5 text-success mb-2" /><p className="text-2xl font-bold text-success">{stats.done}</p><p className="text-xs text-muted-foreground">Përfunduar</p></div>
          <div className="glass-card rounded-xl p-4"><Camera className="w-5 h-5 text-accent mb-2" /><p className="text-2xl font-bold">{stats.withPhoto}</p><p className="text-xs text-muted-foreground">Me Foto</p></div>
          <div className="glass-card rounded-xl p-4"><MapPin className="w-5 h-5 text-accent mb-2" /><p className="text-2xl font-bold">{stats.withLocation}</p><p className="text-xs text-muted-foreground">Me Lokacion</p></div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant={activeTab === "reports" ? "default" : "outline"} onClick={() => setActiveTab("reports")}><FileText className="w-4 h-4 mr-2" />Raportet</Button>
          <Button variant={activeTab === "map" ? "default" : "outline"} onClick={() => setActiveTab("map")}><Map className="w-4 h-4 mr-2" />Harta</Button>
          <Button variant={activeTab === "finance" ? "default" : "outline"} onClick={() => setActiveTab("finance")}><DollarSign className="w-4 h-4 mr-2" />Financat</Button>
          {currentAdmin?.is_super_admin && (
            <Button variant={activeTab === "admins" ? "default" : "outline"} onClick={() => setActiveTab("admins")}><Users className="w-4 h-4 mr-2" />Adminët</Button>
          )}
        </div>

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Kërko..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Të Gjitha</SelectItem>
                  <SelectItem value="i_ri">I Ri</SelectItem>
                  <SelectItem value="ne_proces">Në Proces</SelectItem>
                  <SelectItem value="perfunduar">Përfunduar</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2"><Checkbox id="photo" checked={hasPhotoFilter} onCheckedChange={(c) => setHasPhotoFilter(!!c)} /><Label htmlFor="photo" className="text-sm">Me Foto</Label></div>
              <div className="flex items-center gap-2"><Checkbox id="loc" checked={hasLocationFilter} onCheckedChange={(c) => setHasLocationFilter(!!c)} /><Label htmlFor="loc" className="text-sm">Me Lokacion</Label></div>
            </div>

            <div className="glass-card-strong rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold">Kodi</th>
                      <th className="text-left p-4 text-sm font-semibold">Titulli</th>
                      <th className="text-left p-4 text-sm font-semibold">Data</th>
                      <th className="text-left p-4 text-sm font-semibold">Foto</th>
                      <th className="text-left p-4 text-sm font-semibold">Lokacion</th>
                      <th className="text-left p-4 text-sm font-semibold">Statusi</th>
                      <th className="text-left p-4 text-sm font-semibold">Veprime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="border-t border-border/50 hover:bg-secondary/30">
                        <td className="p-4 font-mono text-primary font-semibold text-sm">{report.tracking_code}</td>
                        <td className="p-4 text-sm">{report.title}</td>
                        <td className="p-4 text-sm text-muted-foreground">{format(new Date(report.created_at), "dd/MM/yy")}</td>
                        <td className="p-4">{report.photo_url ? <Camera className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-muted-foreground" />}</td>
                        <td className="p-4">{report.has_location ? <MapPin className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-muted-foreground" />}</td>
                        <td className="p-4"><StatusBadge status={report.status} /></td>
                        <td className="p-4"><Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}><Eye className="w-4 h-4" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Map Tab */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                Harta e Raporteve
              </h3>
              <p className="text-sm text-muted-foreground">
                {reports.filter(r => r.has_location).length} raporte me vendndodhje
              </p>
            </div>
            <ReportsMap reports={reports} onReportClick={(report) => setSelectedReport(report)} />
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === "finance" && (
          <div className="space-y-6">
            <div className="glass-card-strong rounded-xl p-6">
              <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-warning" />Vlerësim Total Demesh</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-warning/10 rounded-xl p-6 border border-warning/30">
                  <p className="text-sm text-muted-foreground mb-2">Kostoja Minimale</p>
                  <p className="text-3xl font-bold text-warning">{financials.totalMin.toLocaleString()} ALL</p>
                </div>
                <div className="bg-destructive/10 rounded-xl p-6 border border-destructive/30">
                  <p className="text-sm text-muted-foreground mb-2">Kostoja Maksimale</p>
                  <p className="text-3xl font-bold text-destructive">{financials.totalMax.toLocaleString()} ALL</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card-strong rounded-xl p-6">
              <h3 className="font-display text-lg font-bold mb-4">Sipas Kategorisë</h3>
              <div className="space-y-3">
                {Object.entries(financials.byCategory).map(([cat, data]) => (
                  <div key={cat} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div><p className="font-medium">{cat}</p><p className="text-sm text-muted-foreground">{data.count} raporte</p></div>
                    <div className="text-right"><p className="text-sm text-warning">{data.min.toLocaleString()} - {data.max.toLocaleString()} ALL</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === "admins" && currentAdmin?.is_super_admin && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-xl font-bold">Menaxhimi i Adminëve</h3>
              <Button onClick={() => setShowAddAdmin(true)}><UserPlus className="w-4 h-4 mr-2" />Shto Admin</Button>
            </div>
            
            <div className="grid gap-4">
              {admins.map((admin) => (
                <div key={admin.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${admin.is_super_admin ? 'hero-gradient' : 'bg-secondary'}`}>
                      <Shield className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{admin.full_name || admin.email}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                      {admin.is_super_admin && <span className="text-xs text-primary">Super Admin</span>}
                    </div>
                  </div>
                  {admin.id !== currentAdmin?.id && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setShowEditAdmin(admin); setNewAdminName(admin.full_name || ""); setNewAdminSuper(admin.is_super_admin); }}><Edit className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteAdmin(admin.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedReport(null)}>
            <div className="glass-card-strong rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Kodi: <span className="font-mono font-bold text-primary">{selectedReport.tracking_code}</span></p>
                  <h2 className="font-display text-xl font-bold">{selectedReport.title}</h2>
                </div>
                <StatusBadge status={selectedReport.status} />
              </div>
              <p className="text-muted-foreground mb-4">{selectedReport.description}</p>
              {selectedReport.photo_url && <img src={selectedReport.photo_url} alt="Foto" className="w-full h-64 object-cover rounded-lg mb-4" />}
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div><strong>Data:</strong> {format(new Date(selectedReport.created_at), "dd MMMM yyyy, HH:mm", { locale: sq })}</div>
                {selectedReport.neighborhood && <div><strong>Lagja:</strong> {selectedReport.neighborhood}</div>}
                {selectedReport.reporter_name && <div><strong>Emri:</strong> {selectedReport.reporter_name}</div>}
                {selectedReport.reporter_email && <div><strong>Email:</strong> {selectedReport.reporter_email}</div>}
              </div>
              
              <div className="border-t border-border pt-4 space-y-4">
                <p className="font-semibold">Ndrysho Statusin:</p>
                <div className="flex gap-2">
                  <Button variant={selectedReport.status === 'i_ri' ? 'default' : 'outline'} size="sm" onClick={() => updateStatus(selectedReport.id, 'i_ri')}>I Ri</Button>
                  <Button variant={selectedReport.status === 'ne_proces' ? 'warning' : 'outline'} size="sm" onClick={() => updateStatus(selectedReport.id, 'ne_proces')}>Në Proces</Button>
                  <Button variant={selectedReport.status === 'perfunduar' ? 'success' : 'outline'} size="sm" onClick={() => { if (!adminNote.trim()) { toast.error("Shkruani përshkrimin!"); return; } updateStatus(selectedReport.id, 'perfunduar'); }}>Përfunduar</Button>
                </div>
                <Textarea placeholder="Përshkruani çfarë është bërë..." value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
                <Button variant="destructive" size="sm" onClick={() => deleteReport(selectedReport.id)}><Trash2 className="w-4 h-4 mr-2" />Fshi Raportin</Button>
              </div>
            </div>
          </div>
        )}

        {/* Add Admin Dialog */}
        <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
          <DialogContent className="glass-card-strong">
            <DialogHeader><DialogTitle>Shto Admin të Ri</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Email</Label><Input value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} /></div>
              <div><Label>Emri i Plotë</Label><Input value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} /></div>
              <div className="flex items-center gap-2"><Checkbox id="super" checked={newAdminSuper} onCheckedChange={(c) => setNewAdminSuper(!!c)} /><Label htmlFor="super">Super Admin</Label></div>
            </div>
            <DialogFooter><Button onClick={addAdmin}>Shto</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Admin Dialog */}
        <Dialog open={!!showEditAdmin} onOpenChange={() => setShowEditAdmin(null)}>
          <DialogContent className="glass-card-strong">
            <DialogHeader><DialogTitle>Përditëso Admin</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Emri i Plotë</Label><Input value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} /></div>
              <div className="flex items-center gap-2"><Checkbox id="super2" checked={newAdminSuper} onCheckedChange={(c) => setNewAdminSuper(!!c)} /><Label htmlFor="super2">Super Admin</Label></div>
            </div>
            <DialogFooter><Button onClick={updateAdmin}>Ruaj</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPage;