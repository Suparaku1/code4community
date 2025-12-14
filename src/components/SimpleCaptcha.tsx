import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldCheck } from "lucide-react";

interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;
}

const SimpleCaptcha = ({ onVerify }: SimpleCaptchaProps) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);

  const generateChallenge = useCallback(() => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setNum1(n1);
    setNum2(n2);
    setAnswer("");
    setIsVerified(false);
    setError(false);
    onVerify(false);
  }, [onVerify]);

  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  const handleVerify = () => {
    const userAnswer = parseInt(answer, 10);
    if (userAnswer === num1 + num2) {
      setIsVerified(true);
      setError(false);
      onVerify(true);
    } else {
      setError(true);
      setIsVerified(false);
      onVerify(false);
      // Generate new challenge after wrong answer
      setTimeout(generateChallenge, 1500);
    }
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
        <ShieldCheck className="w-5 h-5 text-success" />
        <span className="text-sm text-success font-medium">Verifikimi u krye me sukses!</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 glass-card rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Verifikimi Anti-Spam
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateChallenge}
          className="h-8 w-8 p-0"
          aria-label="Gjenero pyetje të re"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg font-mono text-lg">
          <span>{num1}</span>
          <span>+</span>
          <span>{num2}</span>
          <span>=</span>
          <span>?</span>
        </div>
        
        <Input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Përgjigja"
          className={`w-24 font-mono text-center ${error ? "border-destructive" : ""}`}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          aria-label="Shkruani përgjigjen"
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleVerify}
          disabled={!answer}
        >
          Verifiko
        </Button>
      </div>
      
      {error && (
        <p className="text-xs text-destructive">Përgjigje e gabuar. Provoni përsëri.</p>
      )}
    </div>
  );
};

export default SimpleCaptcha;
