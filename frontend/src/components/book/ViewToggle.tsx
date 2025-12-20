import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "cards";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border bg-background p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          value === "list"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={value === "list"}
      >
        <IconList className="w-4 h-4" />
        List
      </button>
      <button
        type="button"
        onClick={() => onChange("cards")}
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          value === "cards"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={value === "cards"}
      >
        <IconLayoutGrid className="w-4 h-4" />
        Cards
      </button>
    </div>
  );
}
