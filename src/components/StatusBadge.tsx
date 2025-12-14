import { Badge } from "@/components/ui/badge";
import { ReportStatus, statusLabels, statusColors } from "@/types/report";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium px-3 py-1 border",
        statusColors[status],
        className
      )}
    >
      {statusLabels[status]}
    </Badge>
  );
};

export default StatusBadge;
