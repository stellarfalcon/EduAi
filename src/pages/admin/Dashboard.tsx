import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalActivities: number;
  recentActivities: Array<{
    activity_name: string;
    activity_timestamp: string;
    email: string;
    role: string;
    full_name: string;
  }>;
  userGrowth: Array<{
    date: string;
    student_count: string;
    teacher_count: string;
  }>;
  userDistribution: Array<{
    role: string;
    value: number;
  }>;
  requestStatusDistribution: Array<{
    status: string;
    value: number;
  }>;
  pendingRequests: Array<{
    id: number;
    request_type: number;
    request_details: string;
    request_date: string;
    email: string;
    full_name: string;
  }>;
  recentAssignments: Array<{
    assignment_id: number;
    title: string;
    due_date: string;
    class_name: string;
    course_name: string;
    teacher_email: string;
    teacher_name: string;
    total_students: number;
    completed_count: number;
  }>;
  upcomingEvents: Array<{
    event_id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    event_type: string;
    organizer: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalActivities: 0,
    recentActivities: [],
    userGrowth: [],
    userDistribution: [],
    requestStatusDistribution: [],
    pendingRequests: [],
    recentAssignments: [],
    upcomingEvents: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        console.log('Dashboard data:', data);
        console.log('User distribution:', data.userDistribution);
        setStats(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:5001/ws/admin');
    
    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        if (update.type === 'new_activity') {
          setStats(prev => ({
            ...prev,
            recentActivities: [update.activity, ...(prev.recentActivities || []).slice(0, 9)],
            totalActivities: (prev.totalActivities || 0) + 1
          }));
        } else if (update.type === 'new_event') {
          setStats(prev => ({
            ...prev,
            upcomingEvents: [update.event, ...(prev.upcomingEvents || []).slice(0, 4)]
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
        <Card title="Total Users">
          <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
        </Card>
        
        <Card title="Active Users">
          <p className="text-2xl font-bold">{stats.activeUsers || 0}</p>
        </Card>
        
        <Card title="Total Activities">
          <p className="text-2xl font-bold">{stats.totalActivities || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="User Growth">
          <div className="h-[400px] w-full">
            {stats.userGrowth && stats.userGrowth.length > 0 ? (
              <BarChart
                data={stats.userGrowth.map(item => {
                  console.log('Processing growth item:', item);
                  const processedItem = {
                    date: new Date(item.date).toLocaleDateString('en-US', { 
                      month: 'short',
                      day: 'numeric'
                    }),
                    Students: Number(item.student_count) || 0,
                    Teachers: Number(item.teacher_count) || 0
                  };
                  console.log('Processed item:', processedItem);
                  return processedItem;
                })}
                keys={['Students', 'Teachers']}
                indexBy="date"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No growth data available
              </div>
            )}
          </div>
        </Card>

        <Card title="User Distribution" className="bg-white">
          <div className="h-[400px] w-full">
            {stats.userDistribution && stats.userDistribution.length > 0 ? (
              <PieChart 
                data={stats.userDistribution.map(item => ({
                  name: item.role.charAt(0).toUpperCase() + item.role.slice(1),
                  value: item.value
                }))} 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No user data available
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activities">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {(stats.recentActivities || []).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{activity.activity_name}</p>
                  <p className="text-sm text-gray-500">
                    {activity.full_name || activity.email} ({activity.role})
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(activity.activity_timestamp).toLocaleString()}
                </p>
              </div>
            ))}
            {(!stats.recentActivities || stats.recentActivities.length === 0) && (
              <p className="text-center text-gray-500 py-4">No recent activities</p>
            )}
          </div>
        </Card>

        <Card title="Upcoming Events">
          <div className="space-y-4">
            {(stats.upcomingEvents || []).map((event, index) => (
              <div key={index} className="flex flex-col p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Type:</span> {event.event_type}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Organizer:</span> {event.organizer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(event.start_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {event.location && (
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">Location:</span> {event.location}
                  </p>
                )}
              </div>
            ))}
            {(!stats.upcomingEvents || stats.upcomingEvents.length === 0) && (
              <p className="text-center text-gray-500 py-4">No upcoming events</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;