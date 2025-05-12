import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { BookOpen, CheckSquare, Calendar, Award, Clock, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface StatsData {
  enrolledCourses: number;
  completedAssignments: number;
  attendance: number;
  assignmentCompletionRate: number;
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
    assignmentCompletionRate: 0,
  });
  
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<AssignmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState<Record<string, number>>({});
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceMarking, setAttendanceMarking] = useState(false);
  const [studentClass, setStudentClass] = useState<any>(null);

  // Use /student/attendance/self endpoint to check if attendance is marked for today
  const checkAttendance = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/attendance/self`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setAttendanceMarked(response.data.marked);
    } catch (error) {
      setAttendanceMarked(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch student stats
        const statsResponse = await axios.get(`${API_URL}/student/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setStatsData(statsResponse.data);

        // Fetch enrolled courses
        const coursesResponse = await axios.get(`${API_URL}/student/courses`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCourses(coursesResponse.data);

        // Fetch upcoming assignments
        const assignmentsResponse = await axios.get(`${API_URL}/student/assignments/upcoming`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUpcomingAssignments(assignmentsResponse.data);

        // Fetch attendance history
        const attendanceResponse = await axios.get(`${API_URL}/student/attendance/history`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setAttendanceHistory(attendanceResponse.data);
        
        // Fetch upcoming events
        const eventsResponse = await axios.get(`${API_URL}/events/upcoming`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUpcomingEvents(eventsResponse.data);
        
        // Check if attendance is already marked for today
        await checkAttendance();
        
        // Fetch student's class
        const classRes = await axios.get(`${API_URL}/student/classes`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setStudentClass(classRes.data && classRes.data.length > 0 ? classRes.data[0] : null);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleMarkAttendance = async () => {
    setAttendanceMarking(true);
    try {
      await axios.post(`${API_URL}/student/attendance/mark`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Attendance marked for today!');
      await checkAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setAttendanceMarking(false);
    }
  };

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
      {studentClass && (
        <Card className="bg-gradient-to-r from-secondary-100 to-secondary-200 border border-secondary-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-lg font-bold text-secondary-800">Current Class: {studentClass.class_name}</div>
              <div className="text-sm text-secondary-700 mt-1">
                Teachers:
                {studentClass.teachers && studentClass.teachers.length > 0 ? (
                  <ul className="ml-2 list-disc">
                    {studentClass.teachers.map((teacher: any) => (
                      <li key={teacher.user_id} className="text-secondary-700">
                        {teacher.full_name} <span className="text-xs text-secondary-500">({teacher.email})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="ml-2 text-secondary-500">No teachers assigned</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
      <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80 truncate">Your Attendance</p>
              <h3 className="text-xl md:text-2xl font-bold break-words">{attendanceMarked ? 'Present' : 'Not Marked'}</h3>
              <button
                className={`mt-4 px-4 py-2 rounded-md font-semibold text-sm w-full ${attendanceMarked ? 'bg-success-500 text-white cursor-not-allowed' : 'bg-white text-primary-700 hover:bg-primary-100'} transition`}
                onClick={handleMarkAttendance}
                disabled={attendanceMarked || attendanceMarking}
              >
                {attendanceMarked ? 'Marked' : attendanceMarking ? 'Marking...' : 'Mark Now'}
              </button>
            </div>
          </div>
        </Card>
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
              <p className="text-sm font-medium text-white/80">Assignment Completion Rate</p>
              <h3 className="text-2xl font-bold">{statsData.assignmentCompletionRate}%</h3>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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