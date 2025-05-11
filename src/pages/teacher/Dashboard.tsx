import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { Calendar, Users, BookOpen, CheckCircle2, UserCheck, BarChart2 } from 'lucide-react';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface StatsData {
  totalStudents: number;
  totalCourses: number;
  completedAssignments: number;
  avgAttendance: number;
}

interface StudentData {
  user_id: number;
  full_name: string;
  attendance: number;
  performance: number;
}

interface Activity {
  id: number;
  type: string;
  title?: string;
  student?: string;
  date: string;
  grade?: string;
  actor_type: string;
  user_name: string;
  role: string;
  description: string;
}

interface Event {
  event_id: number;
  title: string;
  description: string;
  event_date: string;
}

const TeacherDashboard = () => {
  const [statsData, setStatsData] = useState<StatsData>({
    totalStudents: 0,
    totalCourses: 0,
    completedAssignments: 0,
    avgAttendance: 0,
  });
  
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [attendanceStats, setAttendanceStats] = useState<{ present: number; absent: number; excused: number; total: number }>({ present: 0, absent: 0, excused: 0, total: 0 });
  const [avgAttendance, setAvgAttendance] = useState<number>(0);
  const [attendanceMarked, setAttendanceMarked] = useState<boolean>(false);
  const [attendanceMarking, setAttendanceMarking] = useState<boolean>(false);
  const [totalClasses, setTotalClasses] = useState<number>(0);
  const [activityRoleFilter, setActivityRoleFilter] = useState('all');
  const [activityClassFilter, setActivityClassFilter] = useState('');
  const [activityStudentFilter, setActivityStudentFilter] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch teacher stats
        const statsResponse = await axios.get(`${API_URL}/teacher/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setStatsData(statsResponse.data);

        // Fetch student data with performance
        const studentsResponse = await axios.get(`${API_URL}/teacher/students/performance`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setStudentData(studentsResponse.data);

        // Fetch recent activities
        const activitiesResponse = await axios.get(`${API_URL}/teacher/activities`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setRecentActivities(activitiesResponse.data);
        
        // Fetch upcoming events
        const eventsResponse = await axios.get(`${API_URL}/events/upcoming`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setUpcomingEvents(eventsResponse.data);

        // Fetch classes for this teacher (only assigned classes)
        const fetchClasses = async () => {
          try {
            const classesRes = await axios.get(`${API_URL}/teacher/classes`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const classList = classesRes.data.map((c: any) => ({ id: c.class_id, name: c.class_name }));
            setClasses(classList);
            setTotalClasses(classList.length);
            // Set default selected class
            if (classList.length > 0 && selectedClassId === '') {
              setSelectedClassId(classList[0].id);
            } else if (classList.length === 0) {
              setSelectedClassId('');
            }
          } catch (error) {
            setClasses([]);
            setTotalClasses(0);
            setSelectedClassId('');
            toast.error('Failed to load classes');
          }
        };
        fetchClasses();

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch students for selected class
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId) return;
      try {
        const res = await axios.get(`${API_URL}/teacher/classes`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const classObj = res.data.find((c: any) => c.class_id === selectedClassId);
        if (!classObj) return;
        // Fetch students in this class
        const studentsRes = await axios.get(`${API_URL}/teacher/classes/${selectedClassId}/students`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setStudents(studentsRes.data.map((s: any) => ({ id: s.user_id, name: s.full_name })));
      } catch (error) {
        setStudents([]);
      }
    };
    if (selectedClassId) fetchStudents();
  }, [selectedClassId]);

  // Fetch attendance stats for selected class or student
  useEffect(() => {
    const fetchAttendanceStats = async () => {
      try {
        let url = `${API_URL}/teacher/attendance/stats`;
        if (selectedStudentId) {
          url += `?studentId=${selectedStudentId}`;
        } else if (selectedClassId) {
          url += `?classId=${selectedClassId}`;
        }
        const res = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setAttendanceStats({
          present: parseInt(res.data.present) || 0,
          absent: parseInt(res.data.absent) || 0,
          excused: parseInt(res.data.excused) || 0,
          total: parseInt(res.data.total) || 0,
        });
      } catch (error) {
        setAttendanceStats({ present: 0, absent: 0, excused: 0, total: 0 });
      }
    };
    if (selectedClassId || selectedStudentId) fetchAttendanceStats();
  }, [selectedClassId, selectedStudentId]);

  // Fetch average attendance for selected class or student
  useEffect(() => {
    const fetchAvgAttendance = async () => {
      try {
        let url = `${API_URL}/teacher/attendance/average`;
        if (selectedStudentId) {
          url += `?studentId=${selectedStudentId}`;
        } else if (selectedClassId) {
          url += `?classId=${selectedClassId}`;
        }
        const res = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setAvgAttendance(res.data.average || 0);
      } catch (error) {
        setAvgAttendance(0);
      }
    };
    if (selectedClassId || selectedStudentId) fetchAvgAttendance();
  }, [selectedClassId, selectedStudentId]);

  // Check if teacher has already marked attendance for today
  useEffect(() => {
    const checkAttendance = async () => {
      try {
        const res = await axios.get(`${API_URL}/teacher/attendance/self`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setAttendanceMarked(res.data.marked);
      } catch (error) {
        setAttendanceMarked(false);
      }
    };
    checkAttendance();
  }, []);

  const handleMarkAttendance = async () => {
    setAttendanceMarking(true);
    try {
      await axios.post(`${API_URL}/teacher/attendance/mark`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Attendance marked for today!');
      setAttendanceMarked(true);
    } catch (error) {
      toast.error('Failed to mark attendance.');
    } finally {
      setAttendanceMarking(false);
    }
  };

  // Chart data
  const attendanceData = {
    labels: ['Present', 'Absent', 'Excused'],
    datasets: [
      {
        data: [
          statsData.avgAttendance,
          100 - statsData.avgAttendance - 5, // Assuming 5% excused
          5 // Assuming 5% excused
        ],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 1,
      },
    ],
  };

  const performanceData = {
    labels: studentData.map(student => student.full_name),
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

  // Format event date
  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Attendance pie chart data
  const filteredAttendanceData = {
    labels: ['Present', 'Absent', 'Excused'],
    datasets: [
      {
        data: [attendanceStats.present, attendanceStats.absent, attendanceStats.excused],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 1,
      },
    ],
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Teacher Attendance Tile */}
        <Card className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white h-full">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center min-w-0">
              <div className="p-3 rounded-full bg-white/20 mr-4">
                <UserCheck size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">Your Attendance</p>
                <h3 className="text-xl md:text-2xl font-bold break-words">{attendanceMarked ? 'Present' : 'Not Marked'}</h3>
              </div>
            </div>
            <button
              className={`mt-4 w-full px-4 py-2 rounded-md font-semibold text-sm ${attendanceMarked ? 'bg-success-500 text-white cursor-not-allowed' : 'bg-white text-cyan-700 hover:bg-cyan-100'} transition`}
              onClick={handleMarkAttendance}
              disabled={attendanceMarked || attendanceMarking}
            >
              {attendanceMarked ? 'Marked' : attendanceMarking ? 'Marking...' : 'Mark Now'}
            </button>
          </div>
        </Card>
        {/* Total Students Tile */}
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Total Students (All Classes)</p>
              <h3 className="text-2xl font-bold">{statsData.totalStudents}</h3>
            </div>
          </div>
        </Card>
        {/* Total Classes Tile */}
        <Card className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/20 mr-4">
              <BarChart2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Total Classes</p>
              <h3 className="text-2xl font-bold">{totalClasses}</h3>
            </div>
          </div>
        </Card>
        {/* Active Courses Tile */}
        <Card className="bg-gradient-to-r from-success-500 to-success-600 text-white">
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
        {/* Avg. Attendance Tile (filterable) */}
        <Card className="bg-gradient-to-r from-warning-500 to-warning-600 text-white h-full">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center min-w-0">
              <div className="p-3 rounded-full bg-white/20 mr-4">
                <Calendar size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">Avg. Attendance</p>
                <h3 className="text-xl md:text-2xl font-bold break-words">{avgAttendance}%</h3>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4 w-full">
              <select
                className="rounded-md px-2 py-1 text-sm text-gray-700 w-full"
                value={selectedClassId}
                onChange={e => {
                  setSelectedClassId(Number(e.target.value));
                  setSelectedStudentId('');
                }}
              >
                <option value="">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                className="rounded-md px-2 py-1 text-sm text-gray-700 w-full"
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(Number(e.target.value))}
                disabled={!selectedClassId || students.length === 0}
              >
                <option value="">All Students</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Class Attendance" className="lg:col-span-1">
          <div className="flex flex-col gap-4 h-64">
            <div className="flex gap-2 mb-2">
              <select
                className="rounded-md px-2 py-1 text-sm text-gray-700"
                value={selectedClassId}
                onChange={e => {
                  setSelectedClassId(Number(e.target.value));
                  setSelectedStudentId('');
                }}
              >
                <option value="">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                className="rounded-md px-2 py-1 text-sm text-gray-700"
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(Number(e.target.value))}
                disabled={!selectedClassId || students.length === 0}
              >
                <option value="">All Students</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex justify-center items-center">
              <Pie 
                data={filteredAttendanceData} 
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
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
          <div className="mb-4 flex flex-wrap gap-2">
            <select
              className="rounded-md px-2 py-1 text-sm text-gray-700"
              value={activityRoleFilter}
              onChange={e => setActivityRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
            <select
              className="rounded-md px-2 py-1 text-sm text-gray-700"
              value={activityClassFilter}
              onChange={e => setActivityClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              className="rounded-md px-2 py-1 text-sm text-gray-700"
              value={activityStudentFilter}
              onChange={e => setActivityStudentFilter(e.target.value)}
              disabled={!activityClassFilter || students.length === 0}
            >
              <option value="">All Students</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-4 h-96 overflow-y-auto">
            {recentActivities
              .filter(activity => {
                // Today's activities only
                const activityDate = new Date(activity.date);
                const today = new Date();
                if (
                  activityDate.getFullYear() !== today.getFullYear() ||
                  activityDate.getMonth() !== today.getMonth() ||
                  activityDate.getDate() !== today.getDate()
                ) return false;
                // Role filter
                if (activityRoleFilter !== 'all' && activity.role !== activityRoleFilter) return false;
                // Class filter (if available)
                if (activityClassFilter && activity.class_id && String(activity.class_id) !== activityClassFilter) return false;
                // Student filter
                if (activityStudentFilter && String(activity.user_id) !== activityStudentFilter) return false;
                return true;
              })
              .map((activity, idx) => (
                <div key={idx} className="flex items-start border-b border-gray-100 pb-3">
                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                    activity.actor_type === 'self' ? 'bg-primary-500' : 'bg-warning-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-primary-700">{activity.user_name}</span>
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 capitalize">{activity.role}</span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(activity.date).toLocaleString()}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-800">{activity.description}</div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
        
        <Card title="Student Overview" className="lg:col-span-1">
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
                  <tr key={student.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
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