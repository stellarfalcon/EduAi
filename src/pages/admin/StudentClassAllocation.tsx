import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { Search, Users, UserPlus, UserMinus, BookOpen, BarChart2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/constants';

interface Student {
  user_id: number;
  full_name: string;
  email: string;
  class_id?: number;
  class_name?: string;
  attendance?: number;
  performance?: number;
}

interface Class {
  class_id: number;
  class_name: string;
  total_students: number;
}

const StudentClassAllocation = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [showUnassigned, setShowUnassigned] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all students (admin endpoint)
        const studentsRes = await axios.get(`${API_URL}/admin/users?role=student`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setStudents(studentsRes.data);

        // Fetch all classes (admin endpoint)
        const classesRes = await axios.get(`${API_URL}/admin/classes`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setClasses(classesRes.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAllocateStudent = async (studentId: number, classId: number) => {
    try {
      await axios.post(`${API_URL}/admin/allocate-student`, {
        studentId,
        classId
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      setStudents(students.map(student => 
        student.user_id === studentId 
          ? { ...student, class_id: classId, class_name: classes.find(c => c.class_id === classId)?.class_name }
          : student
      ));

      toast.success('Student allocated to class successfully');
    } catch (error) {
      console.error('Error allocating student:', error);
      toast.error('Failed to allocate student to class');
    }
  };

  const handleRemoveAllocation = async (studentId: number) => {
    try {
      await axios.delete(`${API_URL}/admin/remove-student-allocation/${studentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      setStudents(students.map(student => 
        student.user_id === studentId 
          ? { ...student, class_id: undefined, class_name: undefined }
          : student
      ));

      toast.success('Student allocation removed from class successfully');
    } catch (error) {
      console.error('Error removing allocation:', error);
      toast.error('Failed to remove student allocation from class');
    }
  };

  const getPerformanceColor = (performance?: number) => {
    if (!performance) return 'text-gray-500';
    if (performance >= 90) return 'text-success-600';
    if (performance >= 75) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getAttendanceColor = (attendance?: number) => {
    if (!attendance) return 'text-gray-500';
    if (attendance >= 90) return 'text-success-600';
    if (attendance >= 80) return 'text-warning-600';
    return 'text-danger-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-slow">Loading data...</div>
      </div>
    );
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === '' || student.class_id === selectedClass;
    const matchesUnassigned = !showUnassigned || !student.class_id;
    return matchesSearch && matchesClass && matchesUnassigned;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Student Class Allocation</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search students..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={selectedClass}
          onChange={(e) => setSelectedClass(Number(e.target.value))}
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
          ))}
        </select>

        <Button
          variant={showUnassigned ? "primary" : "outline"}
          onClick={() => setShowUnassigned(!showUnassigned)}
        >
          {showUnassigned ? "Show All" : "Show Unallocated"}
        </Button>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.user_id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{student.full_name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{student.email}</p>
                </div>
                {student.class_id ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    <BookOpen size={14} className="mr-1" />
                    {student.class_name}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Unallocated
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <BarChart2 size={16} className="mr-2" />
                  <span className={getPerformanceColor(student.performance)}>
                    Performance: {student.performance ? `${student.performance}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users size={16} className="mr-2" />
                  <span className={getAttendanceColor(student.attendance)}>
                    Attendance: {student.attendance ? `${student.attendance}%` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                {student.class_id ? (
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={() => handleRemoveAllocation(student.user_id)}
                  >
                    <UserMinus size={16} className="mr-2" />
                    Remove Allocation
                  </Button>
                ) : (
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onChange={(e) => handleAllocateStudent(student.user_id, Number(e.target.value))}
                    value=""
                  >
                    <option value="">Allocate to Class</option>
                    {classes.map(c => (
                      <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search term.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentClassAllocation; 