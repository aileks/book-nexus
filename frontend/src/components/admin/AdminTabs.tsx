import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "books" | "authors" | "series";

type AdminTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
      {(["books", "authors", "series"] as const).map((tab) => (
        <Button
          key={tab}
          variant={activeTab === tab ? "default" : "secondary"}
          onClick={() => onTabChange(tab)}
          size="sm"
          className={cn("flex-1 sm:flex-initial cursor-pointer")}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </Button>
      ))}
    </div>
  );
}
