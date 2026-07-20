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
  FileCode2,
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
  AlertCircle,
  CheckCircle,
  Info,
  ShieldAlert,
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

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigationItems: SidebarItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Applications", href: "/admin/applications", icon: <FileCheck className="h-5 w-5" /> },
    {
      name: "Organizations",
      href: "/admin/organizations",
      icon: <Building2 className="h-5 w-5" />,
    },
    { name: "Auditors", href: "/admin/auditors", icon: <Users className="h-5 w-5" /> },
    { name: "Training Institutes", href: "/admin/training-institutes", icon: <Building2 className="h-5 w-5" /> },
    { name: "Advisory Board", href: "/admin/advisory", icon: <Users className="h-5 w-5" /> },
    { name: "Credentials", href: "/admin/credentials", icon: <Award className="h-5 w-5" /> },
    { name: "Certificates", href: "/admin/certificates", icon: <FileCheck className="h-5 w-5" /> },
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
    <div className="flex h-full flex-col text-white" style={{ background: 'linear-gradient(180deg, #0F2747 0%, #0B1E36 100%)' }}>
      {/* Brand Header */}
      <div
        className={`flex items-center border-b border-white/10 ${
          isCollapsed
            ? "flex-col justify-center gap-3 px-2 py-5"
            : "justify-between px-5 py-[20px]"
        }`}
      >
        {/* Logo + Text group */}
        <div className={`flex items-center ${isCollapsed ? "flex-col gap-2" : "gap-4"}`}>
          {/* Logo container — square, transparent bg, NO circle */}
          <div
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 72,
              height: 72,
              padding: 4,
              background: 'transparent',
              borderRadius: 8,
            }}
            title={isCollapsed ? "IUCB - International Union for Certification & Benchmarking" : undefined}
          >
            <img
              src="/logos/FINAL_LOGO_DESIGN.jpeg"
              alt="IUCB Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                imageRendering: 'auto',
              }}
            />
          </div>

          {/* Text — only when expanded */}
          {!isCollapsed && (
            <div className="flex flex-col justify-center">
              <span
                className="font-bold text-white leading-none"
                style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.3px' }}
              >
                IUCB
              </span>
              <span
                className="font-medium text-[#CBD5E1]"
                style={{ fontSize: 12, lineHeight: 1.3, marginTop: 6 }}
              >
                International Union for<br />Certification &amp; Benchmarking
              </span>
              <div style={{ marginTop: 10 }}>
                <span
                  className="text-white font-semibold uppercase tracking-wider inline-flex items-center justify-center"
                  style={{
                    background: '#2D4EB3',
                    borderRadius: 999,
                    height: 26,
                    paddingLeft: 14,
                    paddingRight: 14,
                    fontSize: 10,
                    letterSpacing: '0.08em',
                  }}
                >
                  ADMIN PORTAL
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Collapse / Expand toggle */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden md:flex shrink-0 items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav
        className="sidebar-nav flex-1 space-y-1.5 px-3 py-4 overflow-y-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        } as React.CSSProperties}
      >
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
        className={`hidden md:block shrink-0 border-r border-slate-200 transition-all duration-350 ${isCollapsed ? "w-20" : "w-72"}`}
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
              <SheetContent side="left" className="p-0 w-72 border-r-0">
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
            {/* Global Search Mock Removed */}




            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
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
