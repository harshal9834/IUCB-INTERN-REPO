import React, { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "../context/auth-context";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  LayoutDashboard,
  Building2,
  Users,
  Award,
  FileCheck,
  Newspaper,
  BarChart3,
  History,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  User as UserIcon,
  ChevronDown,
  Globe,
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigationItems: SidebarItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      name: "Organizations",
      href: "/admin/organizations",
      icon: <Building2 className="h-5 w-5" />,
    },
    { name: "Auditors", href: "/admin/auditors", icon: <Users className="h-5 w-5" /> },
    { name: "Credentials", href: "/admin/credentials", icon: <Award className="h-5 w-5" /> },
    { name: "Applications", href: "/admin/applications", icon: <FileCheck className="h-5 w-5" /> },
    { name: "Content", href: "/admin/content", icon: <Newspaper className="h-5 w-5" /> },
    { name: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: <History className="h-5 w-5" /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate({ to: "/admin/login" });
  };

  // Helper to extract breadcrumb nodes from path
  const getBreadcrumbs = () => {
    const segments = currentPath.split("/").filter(Boolean);
    return segments.map((seg, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const name = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
      return { name, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#0F2942] text-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-[#0F2942]">
            <Globe className="h-5 w-5 text-[#0F2942]" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-[#D4AF37]">
              IUCB{" "}
              <span className="text-white text-xs font-medium px-1.5 py-0.5 rounded bg-slate-700 ml-1">
                Admin
              </span>
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden md:block text-slate-350 hover:text-[#D4AF37] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="hidden md:block mx-auto text-slate-350 hover:text-[#D4AF37] transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#D4AF37] text-[#0F2942] shadow-sm font-semibold"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              {item.icon}
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile/Logout actions */}
      <div className="border-t border-slate-700 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-all"
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      {/* 1. Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 border-r border-slate-200 transition-all duration-350 ${isCollapsed ? "w-16" : "w-64"}`}
      >
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 2. Topbar Navigation */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-700">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Breadcrumb path */}
            <nav className="hidden sm:flex items-center space-x-1.5 text-sm text-slate-500 font-medium">
              <Link to="/admin/dashboard" className="hover:text-[#0F2942]">
                IUCB
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.href}>
                  <span className="text-slate-300">/</span>
                  <Link
                    to={crumb.href}
                    className={
                      idx === breadcrumbs.length - 1
                        ? "text-[#0F2942] font-semibold"
                        : "hover:text-[#0F2942]"
                    }
                  >
                    {crumb.name}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Search box UI & Notifications Menu & User Profile Menu */}
          <div className="flex items-center gap-4">
            {/* Global Search Mock */}
            <div className="relative hidden lg:block w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Global search..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F2942] transition-all"
              />
            </div>

            {/* Notification triggers */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-xl z-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Notifications
                  </h4>
                  <div className="space-y-3">
                    <div className="text-xs border-b border-slate-50 pb-2">
                      <p className="font-semibold text-[#0F2942]">New Accreditation Application</p>
                      <p className="text-slate-500 mt-0.5">
                        EuroCert Compliance BV requested accreditation audit review.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">5 mins ago</span>
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-[#0F2942]">System Warning</p>
                      <p className="text-slate-500 mt-0.5">
                        Database scaling parameters modified successfully.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F2942] text-white text-xs font-bold">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "AD"}
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-xs font-semibold text-[#0F2942]">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {user?.role || "Accreditor"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1.5 shadow-xl z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-[10px] text-slate-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="h-4 w-4" /> Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-slate-50 transition-colors text-left border-t border-slate-100"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. Page Body Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>

        {/* 4. Layout Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} IUCB — International Accreditation Authority. All Rights
          Reserved. Authorized personnel only.
        </footer>
      </div>
    </div>
  );
};
export default DashboardLayout;
