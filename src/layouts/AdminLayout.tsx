import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const AdminLayout = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Admin Portal</h1>
            <div className="flex items-center">
              <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {user.email}
              </span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;