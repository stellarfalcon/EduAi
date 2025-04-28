import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { STATUS } from '../../config/constants';
import axios from 'axios';
import { API_URL } from '../../config/constants';

interface RegistrationRequest {
  id: number;
  username: string;
  role: string;
  created_at: string;
  status: string;
}

const RegistrationRequests = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchRegistrationRequests = async () => {
      try {
        // Mock data for development
        const mockRequests = [
          { id: 1, username: 'john.doe@example.com', role: 'teacher', created_at: '2025-03-01T14:23:45Z', status: 'pending' },
          { id: 2, username: 'jane.smith@example.com', role: 'student', created_at: '2025-03-02T09:15:30Z', status: 'pending' },
          { id: 3, username: 'alice.brown@example.com', role: 'teacher', created_at: '2025-03-02T16:45:12Z', status: 'approved' },
          { id: 4, username: 'bob.wilson@example.com', role: 'student', created_at: '2025-03-03T10:10:22Z', status: 'rejected' },
          { id: 5, username: 'emma.clark@example.com', role: 'student', created_at: '2025-03-04T08:30:15Z', status: 'pending' },
        ];
        
        setRequests(mockRequests);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching registration requests:', error);
        toast.error('Failed to load registration requests');
        setIsLoading(false);
      }
    };
    
    fetchRegistrationRequests();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      // In production this would be an API call
      // await axios.put(`${API_URL}/admin/registration-requests/${id}/approve`);
      
      // Update local state to reflect the change
      setRequests(requests.map(request => 
        request.id === id ? { ...request, status: 'approved' } : request
      ));
      
      toast.success('Registration request approved successfully');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve registration request');
    }
  };

  const handleReject = async (id: number) => {
    try {
      // In production this would be an API call
      // await axios.put(`${API_URL}/admin/registration-requests/${id}/reject`);
      
      // Update local state to reflect the change
      setRequests(requests.map(request => 
        request.id === id ? { ...request, status: 'rejected' } : request
      ));
      
      toast.success('Registration request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject registration request');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Filter and search requests
  const filteredRequests = requests.filter(request => {
    // Status filter
    if (statusFilter !== 'all' && request.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (searchTerm && !request.username.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-slow">Loading registration requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Registration Requests</h1>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.role === 'teacher' 
                          ? 'bg-secondary-100 text-secondary-800' 
                          : 'bg-primary-100 text-primary-800'
                      }`}>
                        {request.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'pending' 
                          ? 'bg-warning-100 text-warning-800' 
                          : request.status === 'approved'
                            ? 'bg-success-100 text-success-800'
                            : 'bg-danger-100 text-danger-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {request.status === 'pending' && (
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="success" 
                            size="sm"
                            icon={<CheckCircle size={16} />}
                            onClick={() => handleApprove(request.id)}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            icon={<XCircle size={16} />}
                            onClick={() => handleReject(request.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No registration requests found.
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

export default RegistrationRequests;