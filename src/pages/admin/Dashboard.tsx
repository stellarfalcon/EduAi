import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { Users, GraduationCap, CalendarClock, Activity } from 'lucide-react';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface StatsData {
  totalStudents: number;
  totalTeachers: number;
  pendingRequests: number;
  averageAttendance: number;
}

interface ActivityData {
  date: string;
  count: number;
}

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState<StatsData>({
    totalStudents: 0,
    totalTeachers: 0,
    pendingRequests: 0,
    averageAttendance: 0,
  });
  
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real application, these would be actual API calls
        // For demo purposes, we're using mock data

        // Mock stats data
        setStatsData({
          totalStudents: 324,
          totalTeachers: 42,
          pendingRequests: 8,
          averageAttendance: 87,
        });

        // Mock recent activities
        setRecentActivities([
          { id: 1, user: 'John Doe', role: 'teacher', activity: 'login', timestamp: '2025-03-04T10:23:45Z' },
          { id: 2, user: 'Jane Smith', role: 'student', activity: 'submit_assignment', timestamp: '2025-03-04T09:45:12Z' },
          { id: 3, user: 'Alice Brown', role: 'teacher', activity: 'create_assignment', timestamp: '2025-03-04T08:30:22Z' },
          { id: 4, user: 'Bob Wilson', role: 'student', activity: 'use_ai_tool', timestamp: '2025-03-04T08:15:38Z' },
          { id: 5, user: 'Eva Green', role: 'student', activity: 'login', timestamp: '2025-03-04T07:55:19Z' },
        ]);

        // Mock activity data for the last 7 days
        const lastWeekData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            date: date.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 50) + 20,
          };
        }).reverse();
        
        setActivityData(lastWeekData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chart data
  const userDistributionData = {
    labels: ['Students', 'Teachers', 'Admins'],
    datasets: [
      {
        data: [statsData.totalStudents, statsData.totalTeachers, 3],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        borderColor: ['#2563EB', '#059669', '#D97706'],
        borderWidth: 1,
      },
    ],
  };

  const activityChartData = {
    labels: activityData.map(item => item.date),
    datasets: [
      {
        label: 'Daily Activities',
        data: activityData.map(item => item.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const toolUsageData = {
    labels: ['Lesson Planner', 'Quiz Generator', 'Content Summarizer', 'AI Writing', 'Problem Solver'],
    datasets: [
      {
        label: 'Usage Count',
        data: [65, 42, 73, 31, 49],
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
                    <p className="text-sm font-medium text-gray-800">{activity.user}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activity.role === 'teacher' ? 'bg-secondary-100 text-secondary-800' : 
                      activity.role === 'student' ? 'bg-primary-100 text-primary-800' : 'bg-warning-100 text-warning-800'
                    }`}>
                      {activity.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                  <p className="text-sm mt-1">
                    {activity.activity === 'login' && 'Logged into the system'}
                    {activity.activity === 'submit_assignment' && 'Submitted an assignment'}
                    {activity.activity === 'create_assignment' && 'Created a new assignment'}
                    {activity.activity === 'use_ai_tool' && 'Used an AI tool'}
                  </p>
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
    </div>
  );
};

export default AdminDashboard;