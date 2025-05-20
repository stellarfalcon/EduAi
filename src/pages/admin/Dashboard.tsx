import { useState, useEffect, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { Users, GraduationCap, CalendarClock, Activity, MapPin, Calendar, Clock, Filter } from 'lucide-react';
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

interface AttendanceFilter {
  role: 'all' | 'student' | 'teacher';
  userId: string;
  classId: string;
  timeRange: 'week' | 'month' | 'semester' | 'year';
}

interface Class {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

interface ActivityData {
  date: string;
  teachers: number;
  students: number;
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
  
  const [attendanceFilter, setAttendanceFilter] = useState({
    role: 'all',
    userId: '',
    classId: ''
  });

  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [toolUsage, setToolUsage] = useState<ToolUsage[]>([]);
  const [activityTrends, setActivityTrends] = useState<ActivityData[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState({
    role: 'all',
    classId: '',
    userId: ''
  });
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);

  const fetchRecentActivities = useCallback(async () => {
    console.log('Fetching activities', activityFilter);
    try {
      setIsActivitiesLoading(true);
      const params: { [key: string]: any } = {};
      if (activityFilter.role && activityFilter.role !== 'all') params.role = activityFilter.role;
      if (activityFilter.classId) params.classId = activityFilter.classId;
      if (activityFilter.userId) params.userId = activityFilter.userId;
      const activitiesResponse = await axios.get(`${API_URL}/admin/dashboard/activities`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        params
      });
      setRecentActivities(activitiesResponse.data);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      toast.error('Failed to load recent activities');
    } finally {
      setIsActivitiesLoading(false);
    }
  }, [activityFilter]);

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

      // Fetch classes
      const classesResponse = await axios.get(`${API_URL}/admin/classes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setClasses(classesResponse.data.map((cls: any) => ({
        id: cls.class_id || cls.id,
        name: cls.class_name || cls.name
      })));

      // Fetch users
      const usersResponse = await axios.get(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(usersResponse.data.map((user: any) => ({
        id: user.user_id || user.id,
        name: user.full_name || user.name,
        role: user.role
      })));

      console.log('Teachers array:', users);

      // Fetch filtered attendance
      await fetchFilteredAttendance();

      // Fetch recent activities
      await fetchRecentActivities();

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

      // Fetch teacher assignments
      const teacherAssignmentsResponse = await axios.get(`${API_URL}/admin/teacher-assignments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setTeacherAssignments(teacherAssignmentsResponse.data);

      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setIsLoading(false);
    }
  }, [fetchRecentActivities]);

  const fetchFilteredAttendance = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard/attendance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        params: attendanceFilter
      });
      
      setStatsData(prev => ({
        ...prev,
        averageAttendance: response.data.averageAttendance
      }));
    } catch (error) {
      console.error('Error fetching filtered attendance:', error);
      toast.error('Failed to load attendance data');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchFilteredAttendance();
  }, [attendanceFilter]);

  useEffect(() => {
    fetchRecentActivities();
  }, [fetchRecentActivities]);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchRecentActivities();
    }, 30000);
    return () => clearInterval(pollInterval);
  }, [fetchRecentActivities]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRecentActivities();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchRecentActivities]);

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

  // Activity Trends Bar Chart Data
  const activityTrendsBarData = {
    labels: activityTrends.map(item => item.date),
    datasets: [
      {
        label: 'Teachers Registered',
        data: activityTrends.map(item => item.teachers),
        backgroundColor: '#10B981', // green
        borderColor: '#059669',
        borderWidth: 1,
      },
      {
        label: 'Students Registered',
        data: activityTrends.map(item => item.students),
        backgroundColor: '#3B82F6', // blue
        borderColor: '#2563EB',
        borderWidth: 1,
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
    // Filter out HTTP logs entirely
    if (/^(GET|POST|PUT|DELETE) \//.test(activityName)) {
      return null; // Do not render this activity
    }
    switch (activityName.toLowerCase()) {
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
      case 'assign_teacher':
        return 'Assigned a teacher to a class/course';
      case 'remove_teacher_assignment':
        return 'Removed a teacher-class allocation';
      case 'update_teacher_assignment':
        return 'Updated a teacher-class allocation';
      // Add more as needed for your admin actions
      default:
        return null; // Hide unknown or unimportant actions
    }
  };

  // Fetch teacher assignments on dashboard load
  useEffect(() => {
    const fetchTeacherAssignments = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/teacher-assignments`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setTeacherAssignments(res.data);
      } catch (error) {
        // ignore for now
      }
    };
    fetchTeacherAssignments();
  }, []);

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
              <p className="text-sm font-medium text-white/80">Active Students</p>
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
              <p className="text-sm font-medium text-white/80">Active Teachers</p>
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
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white/80">Avg. Attendance</p>
                  <h3 className="text-2xl font-bold">{statsData.averageAttendance}%</h3>
                </div>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <Filter size={20} />
                </button>
              </div>
              
              {isFilterOpen && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg space-y-3">
                  <select
                    value={attendanceFilter.role}
                    onChange={(e) => setAttendanceFilter(prev => ({ ...prev, role: e.target.value as AttendanceFilter['role'] }))}
                    className="border rounded px-2 py-1 w-full"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                  </select>
                  <select
                    value={attendanceFilter.classId}
                    onChange={(e) => setAttendanceFilter(prev => ({ ...prev, classId: e.target.value }))}
                    className="border rounded px-2 py-1 w-full"
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls, idx) => (
                      <option key={cls.id || idx} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              )}
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
            <Bar 
              data={activityTrendsBarData}
              options={{
                plugins: {
                  legend: {
                    position: 'top',
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
                    ticks: {
                      stepSize: 1,
                      callback: function(value) { return Number(value).toFixed(0); }
                    }
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity size={18} className="text-primary-500 mr-2" />
                <span>Today's Activities</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </span>
                <button
                  onClick={() => {
                    setIsRefreshing(true);
                    fetchRecentActivities().finally(() => setIsRefreshing(false));
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={isRefreshing}
                >
                  <svg
                    className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          }
          className="lg:col-span-1"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              value={activityFilter.role}
              onChange={e => setActivityFilter(f => ({ ...f, role: e.target.value }))}
              className="border rounded px-2 py-1"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
            <select
              value={activityFilter.classId}
              onChange={e => setActivityFilter(f => ({ ...f, classId: e.target.value }))}
              className="border rounded px-2 py-1"
            >
              <option value="">All Classes</option>
              {(
                activityFilter.role === 'teacher' && activityFilter.userId
                  ? Array.from(new Set(
                      teacherAssignments
                        .filter(a => String(a.teacher_id) === String(activityFilter.userId))
                        .map(a => ({ id: a.class_id, name: a.class_name }))
                    )).map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))
                  : classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))
              )}
            </select>
          </div>
          <div className="space-y-4 h-96 overflow-y-auto">
            {isActivitiesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse">Loading activities...</div>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No activities for today
              </div>
            ) : (
              recentActivities.map((activity) => {
                const desc = getActivityDescription(activity.activity_name);
                if (!desc) return null; // Skip HTTP logs and unknowns
                return (
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
                      <p className="text-sm mt-1">{desc}</p>
                    </div>
                  </div>
                );
              })
            )}
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
                    </div>
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