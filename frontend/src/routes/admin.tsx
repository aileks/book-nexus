import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getAdminPassword } from "@/lib/graphql/admin";
import {
  AdminLogin,
  AdminHeader,
  AdminTabs,
  BooksTab,
  AuthorsTab,
  SeriesTab,
} from "@/components/admin";

type Tab = "books" | "authors" | "series";

export const Route = createFileRoute("/admin")({
  component: () => (
    <ErrorBoundary>
      <AdminPage />
    </ErrorBoundary>
  ),
});

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!getAdminPassword();
  });
  const [activeTab, setActiveTab] = useState<Tab>("books");

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto p-3 sm:p-4">
        <AdminTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {activeTab === "books" && <BooksTab key="books" />}
        {activeTab === "authors" && <AuthorsTab key="authors" />}
        {activeTab === "series" && <SeriesTab key="series" />}
      </div>
    </div>
  );
}
