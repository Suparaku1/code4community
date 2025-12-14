import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, Trash2, Download, Mail, Globe, CheckCircle } from "lucide-react";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 hero-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-4">Politika e Privatësisë</h1>
            <p className="text-muted-foreground">E përditësuar: Dhjetor 2024</p>
          </div>

          <div className="space-y-8">
            {/* GDPR Compliance */}
            <section className="glass-card-strong rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold">Përputhshmëria me GDPR</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Code4Community operon në përputhje të plotë me Rregulloren e Përgjithshme të Mbrojtjes së të Dhënave (GDPR) të Bashkimit Europian dhe me ligjin shqiptar për mbrojtjen e të dhënave personale.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Transparencë</p>
                    <p className="text-sm text-muted-foreground">Informim i qartë për përdorimin e të dhënave</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Minimizim i të dhënave</p>
                    <p className="text-sm text-muted-foreground">Mbledhim vetëm të dhënat e nevojshme</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">E drejta për tu harruar</p>
                    <p className="text-sm text-muted-foreground">Mund të kërkoni fshirjen e të dhënave</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Portabilitet</p>
                    <p className="text-sm text-muted-foreground">E drejta për të eksportuar të dhënat</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Collection */}
            <section className="glass-card-strong rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold">Të Dhënat që Mbledhim</h2>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-1">Të dhëna të detyrueshme</h3>
                  <p className="text-sm text-muted-foreground">Titulli dhe përshkrimi i problemit të raportuar.</p>
                </div>
                <div className="border-l-4 border-warning pl-4">
                  <h3 className="font-semibold mb-1">Të dhëna opsionale</h3>
                  <p className="text-sm text-muted-foreground">Emri, email, telefon, foto, vendndodhja GPS (vetëm me pëlqimin tuaj).</p>
                </div>
                <div className="border-l-4 border-muted pl-4">
                  <h3 className="font-semibold mb-1">Të dhëna automatike</h3>
                  <p className="text-sm text-muted-foreground">Cookies teknike për funksionimin e faqes, adresa IP për siguri.</p>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section className="glass-card-strong rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold">Si i Përdorim të Dhënat</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Procesimi dhe ndjekja e raportimeve qytetare
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Komunikimi me ju për statusin e raportimeve (nëse keni dhënë kontakte)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Përmirësimi i shërbimeve tona bazuar në feedback
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Statistika anonime për transparencë publike
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section className="glass-card-strong rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold">Të Drejtat Tuaja</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <Eye className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">E drejta për akses</h3>
                  <p className="text-sm text-muted-foreground">Mund të kërkoni kopje të të gjitha të dhënave tuaja personale.</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <Trash2 className="w-6 h-6 text-destructive mb-2" />
                  <h3 className="font-semibold mb-1">E drejta për fshirje</h3>
                  <p className="text-sm text-muted-foreground">Mund të kërkoni fshirjen e të dhënave tuaja në çdo kohë.</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <Download className="w-6 h-6 text-success mb-2" />
                  <h3 className="font-semibold mb-1">E drejta për portabilitet</h3>
                  <p className="text-sm text-muted-foreground">Mund të eksportoni të dhënat tuaja në format të lexueshëm.</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <Lock className="w-6 h-6 text-warning mb-2" />
                  <h3 className="font-semibold mb-1">E drejta për kundërshtim</h3>
                  <p className="text-sm text-muted-foreground">Mund të kundërshtoni procesimin e të dhënave në raste të caktuara.</p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="glass-card-strong rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold">Kontakti për Privatësinë</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Për çdo pyetje lidhur me të dhënat tuaja personale ose për të ushtruar të drejtat tuaja, na kontaktoni:
              </p>
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-mono text-primary">privacy@code4community.al</p>
                <p className="text-sm text-muted-foreground mt-1">Shkolla Profesionale Elbasan</p>
                <p className="text-sm text-muted-foreground">Elbasan, Shqipëri</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
