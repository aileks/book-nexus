import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "cards";

type ViewToggleProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
};

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border bg-background p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1.5 text-sm font-medium transition-colors",
          value === "list"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={value === "list"}
        aria-label="List view"
      >
        <IconList className="w-4 h-4" />
        <span className="hidden sm:inline">List</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("cards")}
        className={cn(
          "inline-flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1.5 text-sm font-medium transition-colors",
          value === "cards"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={value === "cards"}
        aria-label="Cards view"
      >
        <IconLayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Cards</span>
      </button>
    </div>
  );
}
