import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, Book, FileText, 
  Bot, LogOut, Menu, X, ChevronDown, ChevronRight 
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import { ROUTES } from '../../config/constants';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  Users: <Users size={20} />,
  UserPlus: <UserPlus size={20} />,
  Book: <Book size={20} />,
  FileText: <FileText size={20} />,
  Bot: <Bot size={20} />,
};

interface SidebarProps {
  role: 'admin' | 'teacher' | 'student';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const routes = ROUTES[role.toUpperCase() as keyof typeof ROUTES] || [];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-800"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Backdrop for Mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 pt-16 md:pt-0 transform transition-transform duration-300 ease-in-out z-40
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:w-auto md:flex md:flex-col`}
      >
        <div className={`flex flex-col h-full overflow-y-auto w-64 ${isOpen ? 'w-64' : 'w-20'}`}>
          {/* Logo / Title */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {isOpen ? (
              <span className="text-xl font-semibold text-primary-800">EduPlatform</span>
            ) : (
              <span className="text-xl font-semibold text-primary-800">EP</span>
            )}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="hidden md:block p-1 rounded-full hover:bg-gray-100"
            >
              {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 pt-4 pb-4">
            <ul className="space-y-1 px-2">
              {routes.map((route) => (
                <li key={route.path}>
                  <Link
                    to={route.path}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors
                      ${location.pathname === route.path 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <span className="mr-3">{iconMap[route.icon]}</span>
                    {isOpen && <span>{route.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="border-t border-gray-200 pt-4 pb-4 px-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              {isOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Add ChevronLeft component (it was missing in the imports)
const ChevronLeft = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export default Sidebar;