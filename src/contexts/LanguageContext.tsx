import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "sq" | "en" | "it";

interface Translations {
  [key: string]: {
    sq: string;
    en: string;
    it: string;
  };
}

const translations: Translations = {
  // Navigation
  "nav.home": { sq: "Kryefaqja", en: "Home", it: "Home" },
  "nav.report": { sq: "Raporto Problemin", en: "Report Problem", it: "Segnala Problema" },
  "nav.track": { sq: "Kërko Raportim", en: "Track Report", it: "Traccia Segnalazione" },
  "nav.stats": { sq: "Statistika", en: "Statistics", it: "Statistiche" },
  "nav.login": { sq: "Login Admin", en: "Admin Login", it: "Login Admin" },
  
  // Hero Section
  "hero.title": { sq: "Raporto Problemet e Qytetit", en: "Report City Problems", it: "Segnala Problemi della Città" },
  "hero.subtitle": { sq: "Platforma digjitale për raportimin e problemeve infrastrukturore dhe mjedisore në Elbasan", en: "Digital platform for reporting infrastructure and environmental issues in Elbasan", it: "Piattaforma digitale per segnalare problemi infrastrutturali e ambientali a Elbasan" },
  "hero.cta": { sq: "Raporto Tani", en: "Report Now", it: "Segnala Ora" },
  "hero.track": { sq: "Kërko Raportim", en: "Track Report", it: "Traccia Segnalazione" },
  
  // Report Form
  "report.title": { sq: "Raporto Problemin", en: "Report Problem", it: "Segnala Problema" },
  "report.subtitle": { sq: "Ndihmoni komunitetin duke raportuar problemet në lagje", en: "Help the community by reporting neighborhood problems", it: "Aiuta la comunità segnalando i problemi del quartiere" },
  "form.title": { sq: "Titulli", en: "Title", it: "Titolo" },
  "form.description": { sq: "Përshkrimi", en: "Description", it: "Descrizione" },
  "form.photo": { sq: "Foto (opsionale)", en: "Photo (optional)", it: "Foto (opzionale)" },
  "form.location": { sq: "Përfshi vendndodhjen time", en: "Include my location", it: "Includi la mia posizione" },
  "form.name": { sq: "Emër Mbiemër", en: "Full Name", it: "Nome Cognome" },
  "form.email": { sq: "Email", en: "Email", it: "Email" },
  "form.phone": { sq: "Telefon", en: "Phone", it: "Telefono" },
  "form.submit": { sq: "Dërgo Raportin", en: "Submit Report", it: "Invia Segnalazione" },
  "form.submitting": { sq: "Duke dërguar...", en: "Submitting...", it: "Invio in corso..." },
  
  // Track Page
  "track.title": { sq: "Kërko Raportim", en: "Track Report", it: "Traccia Segnalazione" },
  "track.subtitle": { sq: "Ndiq statusin e raportimit me kodin unik", en: "Track the status of your report with the unique code", it: "Traccia lo stato della tua segnalazione con il codice univoco" },
  "track.placeholder": { sq: "Shkruaj kodin tuaj", en: "Enter your code", it: "Inserisci il tuo codice" },
  "track.notfound": { sq: "Nuk u gjet asnjë raportim me këtë kod.", en: "No report found with this code.", it: "Nessuna segnalazione trovata con questo codice." },
  "track.recent": { sq: "Raportimet e Fundit", en: "Recent Reports", it: "Segnalazioni Recenti" },
  
  // Status
  "status.new": { sq: "I Ri", en: "New", it: "Nuovo" },
  "status.inprocess": { sq: "Në Proces", en: "In Progress", it: "In Corso" },
  "status.done": { sq: "Përfunduar", en: "Resolved", it: "Risolto" },
  
  // Feedback
  "feedback.title": { sq: "Vlerëso Zgjidhjen", en: "Rate the Solution", it: "Valuta la Soluzione" },
  "feedback.question": { sq: "Sa të kënaqur jeni me zgjidhjen?", en: "How satisfied are you with the solution?", it: "Quanto sei soddisfatto della soluzione?" },
  "feedback.comment": { sq: "Koment shtesë (opsional)", en: "Additional comment (optional)", it: "Commento aggiuntivo (opzionale)" },
  "feedback.submit": { sq: "Dërgo Vlerësimin", en: "Submit Rating", it: "Invia Valutazione" },
  "feedback.thanks": { sq: "Faleminderit për vlerësimin!", en: "Thank you for your feedback!", it: "Grazie per la tua valutazione!" },
  
  // Stats
  "stats.title": { sq: "Statistika Publike", en: "Public Statistics", it: "Statistiche Pubbliche" },
  "stats.subtitle": { sq: "Transparencë në shërbim të qytetarëve", en: "Transparency in service of citizens", it: "Trasparenza al servizio dei cittadini" },
  "stats.total": { sq: "Total Raporte", en: "Total Reports", it: "Segnalazioni Totali" },
  "stats.resolved": { sq: "Të Zgjidhura", en: "Resolved", it: "Risolti" },
  "stats.avgtime": { sq: "Kohë Mesatare", en: "Average Time", it: "Tempo Medio" },
  "stats.satisfaction": { sq: "Kënaqësia", en: "Satisfaction", it: "Soddisfazione" },
  
  // GDPR
  "gdpr.title": { sq: "Privatësia & Cookies", en: "Privacy & Cookies", it: "Privacy & Cookie" },
  "gdpr.message": { sq: "Përdorim cookies për të përmirësuar eksperiencën tuaj. Duke vazhduar, pranoni politikën tonë të privatësisë.", en: "We use cookies to improve your experience. By continuing, you accept our privacy policy.", it: "Utilizziamo i cookie per migliorare la tua esperienza. Continuando, accetti la nostra privacy policy." },
  "gdpr.accept": { sq: "Pranoj", en: "Accept", it: "Accetto" },
  "gdpr.decline": { sq: "Vetëm të nevojshme", en: "Essential only", it: "Solo essenziali" },
  "gdpr.privacy": { sq: "Politika e Privatësisë", en: "Privacy Policy", it: "Privacy Policy" },
  
  // Footer
  "footer.about": { sq: "Rreth Nesh", en: "About Us", it: "Chi Siamo" },
  "footer.privacy": { sq: "Privatësia", en: "Privacy", it: "Privacy" },
  "footer.terms": { sq: "Kushtet", en: "Terms", it: "Termini" },
  "footer.contact": { sq: "Kontakt", en: "Contact", it: "Contatti" },
  "footer.rights": { sq: "Të gjitha të drejtat e rezervuara", en: "All rights reserved", it: "Tutti i diritti riservati" },
  
  // Accessibility
  "a11y.skipnav": { sq: "Kalo te përmbajtja", en: "Skip to content", it: "Vai al contenuto" },
  "a11y.contrast": { sq: "Kontrast i lartë", en: "High contrast", it: "Alto contrasto" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "sq";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.sq || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
