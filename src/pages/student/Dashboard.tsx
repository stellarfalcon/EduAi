import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { BookOpen, CheckSquare, Calendar, Award, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface StatsData {
  enrolledCourses: number;
  completedAssignments: number;
  attendance: number;
  averageGrade: number;
}

interface CourseData {
  id: number;
  name: string;
  teacherName: string;
  progress: number;
}

interface AssignmentData {
  id: number;
  title: string;
  courseName: string;
  dueDate: string;
  status: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;

}

const StudentDashboard = () => {
  const [statsData, setStatsData] = useState<StatsData>({
    enrolledCourses: 0,
    completedAssignments: 0,
    attendance: 0,
    averageGrade: 0,
  });
  
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<AssignmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState<Record<string, number>>({});
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock data for development
        setStatsData({
          enrolledCourses: 5,
          completedAssignments: 32,
          attendance: 95,
          averageGrade: 87,
        });

        // Mock course data
        const mockCourses = [
          { id: 1, name: 'Biology', teacherName: 'Dr. Smith', progress: 78 },
          { id: 2, name: 'Mathematics', teacherName: 'Mr. Johnson', progress: 92 },
          { id: 3, name: 'History', teacherName: 'Ms. Brown', progress: 65 },
          { id: 4, name: 'English Literature', teacherName: 'Mrs. Davis', progress: 88 },
          { id: 5, name: 'Physics', teacherName: 'Dr. Wilson', progress: 55 },
        ];
        
        setCourses(mockCourses);

        // Mock assignments data
        const mockAssignments = [
          { id: 1, title: 'Biology Report: Cellular Respiration', courseName: 'Biology', dueDate: '2025-03-10', status: 'In Progress' },
          { id: 2, title: 'Math Problem Set: Quadratic Equations', courseName: 'Mathematics', dueDate: '2025-03-12', status: 'Not Started' },
          { id: 3, title: 'Historical Analysis Essay', courseName: 'History', dueDate: '2025-03-15', status: 'Not Started' },
          { id: 4, title: 'Physics Lab: Force and Motion', courseName: 'Physics', dueDate: '2025-03-18', status: 'Not Started' },
        ];
        
        setUpcomingAssignments(mockAssignments);

        // Mock attendance history
        const mockAttendanceHistory = {
          'Week 1': 100,
          'Week 2': 100,
          'Week 3': 80,
          'Week 4': 100,
          'Week 5': 100,
          'Week 6': 80,
          'Week 7': 100,
          'Week 8': 100,
        };
        
        setAttendanceHistory(mockAttendanceHistory);
        
        // Fetch upcoming events
        const eventsResponse = await axios.get(`${API_URL}/events/upcoming`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUpcomingEvents(eventsResponse.data);
        
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
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [statsData.attendance, 100 - statsData.attendance],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  const attendanceHistoryData = {
    labels: Object.keys(attendanceHistory),
    datasets: [
      {
        label: 'Attendance (%)',
        data: Object.values(attendanceHistory),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Past due';
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
    }
  };

  // Get status color based on days remaining
  const getStatusColor = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'text-danger-600';
    } else if (diffDays <= 2) {
      return 'text-warning-600';
    } else {
      return 'text-success-600';
    }
  };

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 90) {
      return 'bg-success-500';
    } else if (progress >= 70) {
      return 'bg-primary-500';
    } else if (progress >= 50) {
      return 'bg-warning-500';
    } else {
      return 'bg-danger-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-slow">Loading dashboard data...</div>
      </div>
    );
  }

  // Format timestamp
  
  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Enrolled Courses</p>
              <h3 className="text-2xl font-bold">{statsData.enrolledCourses}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <CheckSquare size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Completed Assignments</p>
              <h3 className="text-2xl font-bold">{statsData.completedAssignments}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-success-500 to-success-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Attendance</p>
              <h3 className="text-2xl font-bold">{statsData.attendance}%</h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-warning-500 to-warning-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Average Grade</p>
              <h3 className="text-2xl font-bold">{statsData.averageGrade}%</h3>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Courses Progress" className="lg:col-span-2">
          <div className="space-y-4 h-96 overflow-y-auto">
            {courses.map((course) => (
              <div key={course.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between mb-1">
                  <div>
                    <h4 className="font-medium text-gray-900">{course.name}</h4>
                    <p className="text-sm text-gray-500">Teacher: {course.teacherName}</p>
                  </div>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(course.progress)}`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card title="Attendance Overview" className="lg:col-span-1">
          <div className="flex justify-center items-center h-40 mb-4">
            <div className="w-36 h-36 relative">
              <Doughnut 
                data={attendanceData} 
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw as number;
                          return `${label}: ${value}%`;
                        }
                      }
                    }
                  },
                  cutout: '75%',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">{statsData.attendance}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-40">
            <Line 
              data={attendanceHistoryData}
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
      
      <Card title="Upcoming Assignments">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
                      {assignment.courseName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock size={16} className={`mr-2 ${getStatusColor(assignment.dueDate)}`} />
                      <div>
                        <div className="text-sm text-gray-500">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                        <div className={`text-xs font-medium ${getStatusColor(assignment.dueDate)}`}>
                          {getDaysRemaining(assignment.dueDate)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      assignment.status === 'Completed' ? 'bg-success-100 text-success-800' :
                      assignment.status === 'In Progress' ? 'bg-warning-100 text-warning-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Upcoming Events" className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
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

      
    </div>
  );
};

export default StudentDashboard;