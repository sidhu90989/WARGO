import { ReactNode } from "react";

export type NavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
};

export type HeaderProps = {
  title?: string;
  onMenuClick?: () => void;
  rightActions?: ReactNode;
  leftActions?: ReactNode;
};

export type SidebarProps = {
  items: NavItem[];
  footer?: ReactNode;
  onNavigate?: (href: string) => void;
  className?: string;
};

export type DashboardLayoutProps = {
  header?: HeaderProps;
  sidebar?: SidebarProps;
  children: ReactNode;
};

export type FullScreenLayoutProps = {
  header?: HeaderProps;
  bottomNav?: NavItem[];
  children: ReactNode;
};

export type BottomNavProps = {
  items: NavItem[];
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export type FormCardLayoutProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export type ListGridLayoutProps = {
  children: ReactNode;
  cols?: { base?: number; md?: number; lg?: number };
  gap?: string;
};
