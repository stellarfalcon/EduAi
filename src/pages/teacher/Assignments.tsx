import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { FileText, Plus, Clock, Users, CheckCircle, Search, Filter, ArrowUpDown } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/constants';

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  classId: number;
  className: string;
  courseId: number;
  courseName: string;
  totalStudents: number;
  submittedCount: number;
  createdAt: string;
}

interface CreateAssignmentForm {
  title: string;
  description: string;
  dueDate: string;
  classId: number;
  courseId: number;
}

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [formData, setFormData] = useState<CreateAssignmentForm>({
    title: '',
    description: '',
    dueDate: '',
    classId: 0,
    courseId: 0,
  });
  
  const [classes, setClasses] = useState([
    { id: 1, name: '9th Grade - Section A' },
    { id: 2, name: '9th Grade - Section B' },
    { id: 3, name: '10th Grade - Section A' },
  ]);
  
  const [courses, setCourses] = useState([
    { id: 1, name: 'Biology' },
    { id: 2, name: 'Chemistry' },
    { id: 3, name: 'Physics' },
  ]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // Mock data for development
        const mockAssignments = [
          {
            id: 1,
            title: 'Photosynthesis Lab Report',
            description: 'Write a lab report on the photosynthesis experiment conducted in class.',
            dueDate: '2025-03-10',
            classId: 1,
            className: '9th Grade - Section A',
            courseId: 1,
            courseName: 'Biology',
            totalStudents: 25,
            submittedCount: 18,
            createdAt: '2025-02-25',
          },
          {
            id: 2,
            title: 'Chemical Reactions Worksheet',
            description: 'Complete the worksheet on balancing chemical equations.',
            dueDate: '2025-03-15',
            classId: 1,
            className: '9th Grade - Section A',
            courseId: 2,
            courseName: 'Chemistry',
            totalStudents: 25,
            submittedCount: 10,
            createdAt: '2025-03-01',
          },
          {
            id: 3,
            title: 'Newton\'s Laws Quiz',
            description: 'Prepare for a quiz on Newton\'s three laws of motion.',
            dueDate: '2025-03-08',
            classId: 3,
            className: '10th Grade - Section A',
            courseId: 3,
            courseName: 'Physics',
            totalStudents: 22,
            submittedCount: 22,
            createdAt: '2025-02-28',
          },
        ];
        
        setAssignments(mockAssignments);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast.error('Failed to load assignments');
        setIsLoading(false);
      }
    };
    
    fetchAssignments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.dueDate || !formData.classId || !formData.courseId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      // In a real application, this would make an API call to create the assignment
      
      // Simulate adding a new assignment
      const newAssignment: Assignment = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        classId: Number(formData.classId),
        className: classes.find(c => c.id === Number(formData.classId))?.name || '',
        courseId: Number(formData.courseId),
        courseName: courses.find(c => c.id === Number(formData.courseId))?.name || '',
        totalStudents: 25,
        submittedCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      
      setAssignments(prev => [newAssignment, ...prev]);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        classId: 0,
        courseId: 0,
      });
      
      toast.success('Assignment created successfully!');
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  const handleSort = (field: 'dueDate' | 'title') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort assignments
  const filteredAndSortedAssignments = assignments
    .filter(assignment => 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return sortOrder === 'asc' 
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-slow">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => setShowCreateForm(true)}
        >
          Create Assignment
        </Button>
      </div>
      
      {showCreateForm && (
        <Card title="Create New Assignment">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">
                  Class*
                </label>
                <select
                  id="classId"
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                  Course*
                </label>
                <select
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date*
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Create Assignment
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search assignments..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => handleSort('dueDate')}
          >
            <Clock size={18} className="mr-2 text-gray-500" />
            Date
            <ArrowUpDown size={16} className="ml-1 text-gray-500" />
          </button>
          <button
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => handleSort('title')}
          >
            <FileText size={18} className="mr-2 text-gray-500" />
            Title
            <ArrowUpDown size={16} className="ml-1 text-gray-500" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredAndSortedAssignments.length > 0 ? (
          filteredAndSortedAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {assignment.className}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                      {assignment.courseName}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <div>
                      <div className="text-xs text-gray-500">Due Date</div>
                      <div className="text-sm font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock size={16} className={`mr-2 ${getStatusColor(assignment.dueDate)}`} />
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className={`text-sm font-medium ${getStatusColor(assignment.dueDate)}`}>
                        {getDaysRemaining(assignment.dueDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">{assignment.description}</p>
              </div>
              
              <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center">
                  <Users size={16} className="mr-2 text-gray-500" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{assignment.submittedCount}</span> of <span className="font-medium">{assignment.totalStudents}</span> submitted
                    {assignment.submittedCount > 0 && (
                      <span className="ml-2 text-xs text-success-600">
                        ({Math.round((assignment.submittedCount / assignment.totalStudents) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    View Submissions
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first assignment.</p>
              <div className="mt-6">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Assignment
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Assignments;