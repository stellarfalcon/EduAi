import { useState, useEffect, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { Users, GraduationCap, CalendarClock, Activity, MapPin, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import CreateEventModal from '../../components/ui/CreateEventModal';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface StatsData {
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  pendingRequests: number;
  averageAttendance: number;
}

interface ActivityData {
  date: string;
  count: number;
}

interface Activity {
  id: number;
  user_name: string;
  role: string;
  activity_name: string;
  activity_timestamp: string;
}

interface ToolUsage {
  label: string;
  count: number;
}

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  // event_time: string;
  // location: string;
  // organizer_name: string;
}

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState<StatsData>({
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    pendingRequests: 0,
    averageAttendance: 0,
  });
  
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [toolUsage, setToolUsage] = useState<ToolUsage[]>([]);
  const [activityTrends, setActivityTrends] = useState<ActivityData[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch stats data
      const statsResponse = await axios.get(`${API_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStatsData(statsResponse.data);

      // Fetch recent activities
      const activitiesResponse = await axios.get(`${API_URL}/admin/dashboard/activities`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRecentActivities(activitiesResponse.data);

      // Fetch tool usage stats
      const toolUsageResponse = await axios.get(`${API_URL}/admin/dashboard/tool-usage`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setToolUsage(toolUsageResponse.data);

      // Fetch activity trends
      const trendsResponse = await axios.get(`${API_URL}/admin/dashboard/activity-trends`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setActivityTrends(trendsResponse.data);

      // Fetch upcoming events
      const eventsResponse = await axios.get(`${API_URL}/events/upcoming`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUpcomingEvents(eventsResponse.data);

      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Chart data
  const userDistributionData = {
    labels: ['Students', 'Teachers', 'Admins'],
    datasets: [
      {
        data: [statsData.totalStudents, statsData.totalTeachers, statsData.totalAdmins],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        borderColor: ['#2563EB', '#059669', '#D97706'],
        borderWidth: 1,
      },
    ],
  };

  const activityChartData = {
    labels: activityTrends.map(item => item.date),
    datasets: [
      {
        label: 'Daily Activities',
        data: activityTrends.map(item => item.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const toolUsageData = {
    labels: toolUsage.map(item => item.label),
    datasets: [
      {
        label: 'Usage Count',
        data: toolUsage.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Format timestamp
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // const formatEventTime = (timeString: string) => {
  //   return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  // };

  const getActivityDescription = (activityName: string) => {
    switch (activityName) {
      case 'login':
        return 'Logged into the system';
      case 'submit_assignment':
        return 'Submitted an assignment';
      case 'create_assignment':
        return 'Created a new assignment';
      case 'use_ai_tool':
        return 'Used an AI tool';
      case 'approve_registration':
        return 'Approved a registration request';
      case 'reject_registration':
        return 'Rejected a registration request';
      case 'deactivate_user':
        return 'Deactivated a user';
      case 'reactivate_user':
        return 'Reactivated a user';
      default:
        return activityName;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-slow">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Total Students</p>
              <h3 className="text-2xl font-bold">{statsData.totalStudents}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Total Teachers</p>
              <h3 className="text-2xl font-bold">{statsData.totalTeachers}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-warning-500 to-warning-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Pending Requests</p>
              <h3 className="text-2xl font-bold">{statsData.pendingRequests}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-success-500 to-success-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <CalendarClock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Avg. Attendance</p>
              <h3 className="text-2xl font-bold">{statsData.averageAttendance}%</h3>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="User Distribution">
          <div className="flex justify-center items-center h-64">
            <Doughnut 
              data={userDistributionData} 
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                cutout: '65%',
              }}
            />
          </div>
        </Card>
        
        <Card title="Activity Trends (Last 7 Days)">
          <div className="h-64">
            <Line 
              data={activityChartData}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card 
          title={
            <div className="flex items-center">
              <Activity size={18} className="text-primary-500 mr-2" />
              <span>Recent Activities</span>
            </div>
          }
          className="lg:col-span-1"
        >
          <div className="space-y-4 h-96 overflow-y-auto">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start border-b border-gray-100 pb-3">
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                  activity.role === 'teacher' ? 'bg-secondary-500' : 
                  activity.role === 'student' ? 'bg-primary-500' : 'bg-warning-500'
                }`}></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800">{activity.user_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activity.role === 'teacher' ? 'bg-secondary-100 text-secondary-800' : 
                      activity.role === 'student' ? 'bg-primary-100 text-primary-800' : 'bg-warning-100 text-warning-800'
                    }`}>
                      {activity.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(activity.activity_timestamp)}</p>
                  <p className="text-sm mt-1">{getActivityDescription(activity.activity_name)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card title="AI Tool Usage" className="lg:col-span-2">
          <div className="h-96">
            <Bar 
              data={toolUsageData}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Upcoming Events" className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
            <Button
              variant="primary"
              onClick={() => setIsCreateEventModalOpen(true)}
              size="sm"
            >
              Create Event
            </Button>
          </div>
          
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-primary-50">
                    <Calendar className="h-5 w-5 text-primary-500" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatEventDate(event.event_date)}
                      </span>
                      {/* <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatEventTime(event.event_time)}
                      </span>
                      {event.location && (
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </span>
                      )} */}
                    </div>
                    {/* <div className="mt-1 text-xs text-gray-500">
                      Organized by: {event.organizer_name}
                    </div> */}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No upcoming events
              </div>
            )}
          </div>
        </Card>
      </div>

      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onEventCreated={() => {
          // Refresh events after creation
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default AdminDashboard;