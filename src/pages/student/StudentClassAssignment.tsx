import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { Search, Filter, BookOpen, Users, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/constants';

interface Class {
  class_id: number;
  class_name: string;
  teacher_name: string;
  schedule: string;
  total_students: number;
  description: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  grade?: string;
}

const StudentClassAssignment = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [showAssignments, setShowAssignments] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(`${API_URL}/student/classes`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setClasses(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const fetchAssignments = async (classId: number) => {
    try {
      const response = await axios.get(`${API_URL}/student/classes/${classId}/assignments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setAssignments(response.data);
      setShowAssignments(true);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    }
  };

  const handleClassSelect = (classId: number) => {
    setSelectedClass(classId);
    fetchAssignments(classId);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-success-100 text-success-800';
      case 'In Progress':
        return 'bg-warning-100 text-warning-800';
      case 'Overdue':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-slow">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">My Classes</h1>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search classes..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes
          .filter(classItem => 
            classItem.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classItem.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((classItem) => (
            <div
              key={classItem.class_id}
              className={`cursor-pointer ${
                selectedClass === classItem.class_id ? 'ring-2 ring-primary-500 rounded-lg' : ''
              }`}
              onClick={() => handleClassSelect(classItem.class_id)}
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{classItem.class_name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{classItem.teacher_name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        <Users size={14} className="mr-1" />
                        {classItem.total_students} students
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <Calendar size={16} className="mr-2" />
                    {classItem.schedule}
                  </div>

                  <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                    {classItem.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClassSelect(classItem.class_id);
                      }}
                    >
                      View Assignments
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
      </div>

      {/* Assignments Section */}
      {showAssignments && selectedClass && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Class Assignments</h2>
          <div className="space-y-4">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{assignment.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Clock size={16} className="mr-2" />
                        {getDaysRemaining(assignment.due_date)}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                      {assignment.grade && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          Grade: {assignment.grade}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
                  <p className="mt-1 text-sm text-gray-500">This class has no assignments yet.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentClassAssignment; 