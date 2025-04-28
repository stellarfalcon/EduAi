import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-600 to-secondary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">EduPlatform</h1>
            <p className="text-gray-600 mt-2">Smart Learning Management System</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;