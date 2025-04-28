import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { Calendar, Users, BookOpen, CheckCircle2 } from 'lucide-react';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface StatsData {
  totalStudents: number;
  totalCourses: number;
  completedAssignments: number;
  avgAttendance: number;
}

interface StudentData {
  id: number;
  name: string;
  attendance: number;
  performance: number;
}

const TeacherDashboard = () => {
  const [statsData, setStatsData] = useState<StatsData>({
    totalStudents: 0,
    totalCourses: 0,
    completedAssignments: 0,
    avgAttendance: 0,
  });
  
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock data for development
        setStatsData({
          totalStudents: 45,
          totalCourses: 3,
          completedAssignments: 125,
          avgAttendance: 92,
        });

        // Mock student data
        const mockStudentData = [
          { id: 1, name: 'Alice Smith', attendance: 95, performance: 85 },
          { id: 2, name: 'Bob Johnson', attendance: 88, performance: 78 },
          { id: 3, name: 'Charlie Brown', attendance: 100, performance: 92 },
          { id: 4, name: 'Diana Ross', attendance: 85, performance: 76 },
          { id: 5, name: 'Edward Norton', attendance: 92, performance: 88 },
          { id: 6, name: 'Fiona Apple', attendance: 97, performance: 90 },
          { id: 7, name: 'George Clooney', attendance: 78, performance: 72 },
          { id: 8, name: 'Hannah Baker', attendance: 90, performance: 85 },
        ];
        
        setStudentData(mockStudentData);

        // Mock recent activities
        setRecentActivities([
          { id: 1, type: 'assignment_created', title: 'Math Quiz #3', date: '2025-03-04T10:23:45Z' },
          { id: 2, type: 'assignment_submitted', title: 'Science Project', student: 'Alice Smith', date: '2025-03-04T09:45:12Z' },
          { id: 3, type: 'lesson_planned', title: 'Photosynthesis Basics', date: '2025-03-03T14:30:22Z' },
          { id: 4, type: 'student_joined', student: 'New Student', date: '2025-03-03T11:15:38Z' },
          { id: 5, type: 'assignment_graded', title: 'History Essay', student: 'Bob Johnson', grade: 'A-', date: '2025-03-02T16:55:19Z' },
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chart data
  const attendanceData = {
    labels: ['Present', 'Absent', 'Excused'],
    datasets: [
      {
        data: [85, 10, 5],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 1,
      },
    ],
  };

  const performanceData = {
    labels: studentData.map(student => student.name),
    datasets: [
      {
        label: 'Performance Score (%)',
        data: studentData.map(student => student.performance),
        backgroundColor: '#3B82F6',
        borderWidth: 1,
      },
    ],
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
      <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
      
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
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Active Courses</p>
              <h3 className="text-2xl font-bold">{statsData.totalCourses}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-success-500 to-success-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Completed Assignments</p>
              <h3 className="text-2xl font-bold">{statsData.completedAssignments}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-warning-500 to-warning-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Avg. Attendance</p>
              <h3 className="text-2xl font-bold">{statsData.avgAttendance}%</h3>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Class Attendance" className="lg:col-span-1">
          <div className="flex justify-center items-center h-64">
            <Pie 
              data={attendanceData} 
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </Card>
        
        <Card title="Student Performance" className="lg:col-span-2">
          <div className="h-64">
            <Bar 
              data={performanceData}
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
                    max: 100,
                    ticks: {
                      callback: function(value) {
                        return value + '%';
                      },
                    },
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activities" className="lg:col-span-1">
          <div className="space-y-4 h-96 overflow-y-auto">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start border-b border-gray-100 pb-3">
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                  activity.type.includes('assignment') ? 'bg-primary-500' : 
                  activity.type.includes('lesson') ? 'bg-secondary-500' : 'bg-warning-500'
                }`}></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800">
                      {activity.type === 'assignment_created' && 'Created Assignment'}
                      {activity.type === 'assignment_submitted' && 'Assignment Submitted'}
                      {activity.type === 'lesson_planned' && 'Lesson Plan Created'}
                      {activity.type === 'student_joined' && 'New Student Joined'}
                      {activity.type === 'assignment_graded' && 'Assignment Graded'}
                    </p>
                    <span className="text-xs text-gray-500">{formatDate(activity.date)}</span>
                  </div>
                  <p className="text-sm mt-1">
                    {activity.title && <span className="font-medium">{activity.title}</span>}
                    {activity.student && <span> by {activity.student}</span>}
                    {activity.grade && <span> - Grade: {activity.grade}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card title="Students Overview" className="lg:col-span-1">
          <div className="overflow-x-auto h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentData.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`text-sm ${
                        student.attendance >= 90 ? 'text-success-600' : 
                        student.attendance >= 80 ? 'text-warning-600' : 'text-danger-600'
                      }`}>
                        {student.attendance}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`text-sm ${
                        student.performance >= 90 ? 'text-success-600' : 
                        student.performance >= 75 ? 'text-warning-600' : 'text-danger-600'
                      }`}>
                        {student.performance}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;