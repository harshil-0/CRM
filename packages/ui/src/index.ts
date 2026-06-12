// UI Primitives
export { Button, buttonVariants, type ButtonProps } from './components/button';
export { Input, type InputProps } from './components/input';
export { Badge, badgeVariants, type BadgeProps } from './components/badge';
export { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/card';
export { Skeleton } from './components/skeleton';
export { Avatar, AvatarImage, AvatarFallback } from './components/avatar';
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from './components/dialog';

// Data Components
export { DataTable, type Column, type DataTableProps } from './components/data-table';
export { SearchBar, type SearchBarProps } from './components/search-bar';
export { CommandPalette, type CommandAction, type CommandPaletteProps } from './components/command-palette';
export { KanbanBoard, type KanbanItem, type KanbanColumn, type KanbanBoardProps } from './components/kanban-board';
export { AreaChart, BarChart, type AreaChartProps, type BarChartProps } from './components/charts';
export { EmptyState, type EmptyStateProps } from './components/empty-state';

// Layout
export { AppShell, type AppShellProps } from './layout/app-shell';
export { Sidebar, type SidebarProps, type NavItem } from './layout/sidebar';
export { Navbar, type NavbarProps } from './layout/navbar';
export { PageHeader, type PageHeaderProps } from './layout/page-header';

// Utils
export { cn } from './lib/utils';
