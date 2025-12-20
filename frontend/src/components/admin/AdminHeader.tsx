import { Button } from "@/components/ui/button";
import { clearAdminPassword } from "@/lib/graphql/admin";

interface AdminHeaderProps {
  onLogout: () => void;
}

export function AdminHeader({ onLogout }: AdminHeaderProps) {
  const handleLogout = () => {
    clearAdminPassword();
    onLogout();
  };

  return (
    <header className="border-b px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
      <h1 className="text-base sm:text-lg font-bold truncate">
        Book Nexus Admin
      </h1>
      <Button variant="outline" onClick={handleLogout} size="sm" className="flex-shrink-0">
        Logout
      </Button>
    </header>
  );
}

