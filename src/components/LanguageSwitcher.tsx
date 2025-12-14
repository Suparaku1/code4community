import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const flags: Record<string, string> = {
  sq: "🇦🇱",
  en: "🇬🇧",
  it: "🇮🇹",
};

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const languages: Array<{ code: "sq" | "en" | "it"; label: string }> = [
    { code: "sq", label: "Shqip" },
    { code: "en", label: "English" },
    { code: "it", label: "Italiano" },
  ];

  const cycleLanguage = () => {
    const currentIndex = languages.findIndex((l) => l.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleLanguage}
      className="gap-2 text-muted-foreground hover:text-foreground"
      aria-label="Change language"
    >
      <Globe className="w-4 h-4" />
      <span className="text-lg">{flags[language]}</span>
      <span className="hidden sm:inline text-xs">{languages.find((l) => l.code === language)?.label}</span>
    </Button>
  );
};

export default LanguageSwitcher;
