import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { Search, UserX, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/constants';

interface User {
  user_id: number;
  email: string;
  role: string;
  is_deleted_user: boolean;
  createdAt: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setUsers(response.data);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast.error(error.response?.data?.message || 'Failed to load users');
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleDeactivateUser = async (userId: number) => {
    try {
      await axios.put(
        `${API_URL}/admin/users/${userId}/deactivate`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, is_deleted_user: true } : user
      ));
      
      toast.success('User deactivated successfully');
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handleReactivateUser = async (userId: number) => {
    try {
      console.log('Attempting to reactivate user with ID:', userId);
      const numericId = Number(userId);
      
      const response = await axios.put(
        `${API_URL}/admin/users/${numericId}/reactivate`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('Reactivation response:', response.data);
      
      setUsers(users.map(user => 
        user.user_id === numericId ? { ...user, is_deleted_user: false } : user
      ));
      
      toast.success('User reactivated successfully');
    } catch (error: any) {
      console.error('Error reactivating user:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        userId
      });
      toast.error(error.response?.data?.message || 'Failed to reactivate user');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    
    // Search filter
    if (searchTerm && !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-slow">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
      </div>
      
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by email..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-warning-100 text-warning-800' 
                          : user.role === 'teacher'
                            ? 'bg-secondary-100 text-secondary-800'
                            : 'bg-primary-100 text-primary-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_deleted_user 
                          ? 'bg-danger-100 text-danger-800' 
                          : 'bg-success-100 text-success-800'
                      }`}>
                        {user.is_deleted_user ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role !== 'admin' && (
                        user.is_deleted_user ? (
                          <Button 
                            variant="success" 
                            size="sm"
                            icon={<RefreshCw size={16} />}
                            onClick={() => handleReactivateUser(user.user_id)}
                          >
                            Reactivate
                          </Button>
                        ) : (
                          <Button 
                            variant="danger" 
                            size="sm"
                            icon={<UserX size={16} />}
                            onClick={() => handleDeactivateUser(user.user_id)}
                          >
                            Deactivate
                          </Button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Users;