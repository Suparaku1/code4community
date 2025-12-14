import { Heart, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-sidebar text-sidebar-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 hero-gradient rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Code4Community</h3>
                <p className="text-xs text-sidebar-foreground/60">Elbasan</p>
              </div>
            </div>
            <p className="text-sm text-sidebar-foreground/80 leading-relaxed">
              Aplikacioni qytetar për raportimin e problemeve në lagjet e qytetit të Elbasanit. 
              Së bashku për një komunitet më të mirë!
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-lg">Kontakt</h4>
            <div className="space-y-3">
              <a 
                href="mailto:info@code4community.al" 
                className="flex items-center gap-3 text-sm text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@code4community.al
              </a>
              <a 
                href="tel:+355123456789" 
                className="flex items-center gap-3 text-sm text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                +355 123 456 789
              </a>
              <div className="flex items-center gap-3 text-sm text-sidebar-foreground/80">
                <MapPin className="w-4 h-4" />
                Elbasan, Shqipëri
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-lg">Kreditet</h4>
            <div className="space-y-2 text-sm text-sidebar-foreground/80">
              <p><span className="text-sidebar-foreground">Krijuar nga:</span> Esmerald Suparaku</p>
              <p><span className="text-sidebar-foreground">Supervizor:</span> Juljan Kasapi</p>
              <p className="text-sidebar-foreground/60">
                Mbështetur nga nxënësit e Shkollës Profesionale Elbasan
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-sidebar-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-sidebar-foreground/60">
              © {new Date().getFullYear()} Code4Community Elbasan. Të gjitha të drejtat e rezervuara.
            </p>
            <p className="flex items-center gap-1 text-sm text-sidebar-foreground/60">
              Krijuar me <Heart className="w-4 h-4 text-destructive fill-destructive" /> për komunitetin
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
