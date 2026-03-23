import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Library, Users, BookOpen, History, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const librarianNavItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { name: "Books", path: "/books", icon: <Library size={18} /> },
  { name: "Users", path: "/users", icon: <Users size={18} /> },
  { name: "Borrowing", path: "/borrows", icon: <BookOpen size={18} /> },
  { name: "Reports", path: "/reports", icon: <BarChart3 size={18} /> },
];

const clientNavItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { name: "Browse Books", path: "/catalog", icon: <Library size={18} /> },
  { name: "My Books", path: "/my-books", icon: <BookOpen size={18} /> },
  { name: "History", path: "/history", icon: <History size={18} /> },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  
  const navItems = user?.role === 'librarian' ? librarianNavItems : clientNavItems;

  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border h-screen flex flex-col fixed left-0 top-0 z-40 select-none">
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <img src="/favicon.png" alt="Booklyn Logo" className="h-8 w-8 mr-2" />
        <span className="font-bold text-xl tracking-wide text-sidebar-foreground">BOOKLYN</span>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  location.pathname.startsWith(item.path)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
