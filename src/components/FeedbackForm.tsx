import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, Send, CheckCircle } from "lucide-react";

interface FeedbackFormProps {
  reportId: string;
  trackingCode: string;
}

const FeedbackForm = ({ reportId, trackingCode }: FeedbackFormProps) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Ju lutem zgjidhni një vlerësim");
      return;
    }

    setIsSubmitting(true);
    try {
      // Store feedback in localStorage for now (can be moved to DB later)
      const feedbacks = JSON.parse(localStorage.getItem("report-feedbacks") || "{}");
      feedbacks[reportId] = {
        rating,
        comment,
        tracking_code: trackingCode,
        submitted_at: new Date().toISOString(),
      };
      localStorage.setItem("report-feedbacks", JSON.stringify(feedbacks));
      
      setIsSubmitted(true);
      toast.success(t("feedback.thanks"));
    } catch (error) {
      toast.error("Gabim gjatë dërgimit");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if already submitted
  const existingFeedback = JSON.parse(localStorage.getItem("report-feedbacks") || "{}")[reportId];
  
  if (existingFeedback || isSubmitted) {
    return (
      <div className="mt-4 p-4 bg-primary/10 rounded-xl border border-primary/20 text-center">
        <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="font-semibold text-primary">{t("feedback.thanks")}</p>
        <div className="flex justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${star <= (existingFeedback?.rating || rating) ? "fill-warning text-warning" : "text-muted-foreground"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-secondary/30 rounded-xl border border-border">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Star className="w-4 h-4 text-warning" />
        {t("feedback.title")}
      </h4>
      
      <p className="text-sm text-muted-foreground mb-3">{t("feedback.question")}</p>
      
      {/* Star Rating */}
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none focus:ring-2 focus:ring-primary rounded transition-transform hover:scale-110"
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredRating || rating)
                  ? "fill-warning text-warning"
                  : "text-muted-foreground hover:text-warning/50"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-sm text-muted-foreground ml-2">
            {rating === 1 && "😞 Keq"}
            {rating === 2 && "😐 Jo mirë"}
            {rating === 3 && "🙂 Në rregull"}
            {rating === 4 && "😊 Mirë"}
            {rating === 5 && "🤩 Shkëlqyeshëm"}
          </span>
        )}
      </div>
      
      {/* Comment */}
      <Textarea
        placeholder={t("feedback.comment")}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="mb-3"
      />
      
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        size="sm"
        variant="hero"
      >
        {isSubmitting ? "Duke dërguar..." : (
          <>
            <Send className="w-4 h-4 mr-2" />
            {t("feedback.submit")}
          </>
        )}
      </Button>
    </div>
  );
};

export default FeedbackForm;
