import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { Search, Filter, FileText, Clock, CheckSquare, X, ArrowUpDown } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/constants';

interface Assignment {
  id: number;
  title: string;
  description: string;
  courseName: string;
  teacherName: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue' | 'Not Attempted';
  grade?: string;
  feedback?: string;
}

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(`${API_URL}/student/assignments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setAssignments(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast.error('Failed to load assignments');
        setIsLoading(false);
      }
    };
    
    fetchAssignments();
  }, []);

  const handleViewDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsModal(true);
  };

  const handleSort = (field: 'dueDate' | 'title') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: Assignment['status']) => {
    try {
      await axios.put(
        `${API_URL}/student/assignments/${id}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update local state
      setAssignments(assignments.map(assignment => 
        assignment.id === id ? { ...assignment, status: newStatus } : assignment
      ));
      
      if (selectedAssignment && selectedAssignment.id === id) {
        setSelectedAssignment({ ...selectedAssignment, status: newStatus });
      }
      
      toast.success(`Assignment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating assignment status:', error);
      toast.error('Failed to update assignment status');
    }
  };

  // Get all unique courses for filtering
  const courses = ['all', ...new Set(assignments.map(assignment => assignment.courseName))];

  // Filter and sort assignments
  const filteredAndSortedAssignments = assignments
    .filter(assignment => {
      // Text search
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
      
      // Course filter
      const matchesCourse = courseFilter === 'all' || assignment.courseName === courseFilter;
      
      return matchesSearch && matchesStatus && matchesCourse;
    })
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

  // Get status color
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

  // Get due date color
  const getDueDateColor = (dueDate: string) => {
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
        <h1 className="text-2xl font-bold text-gray-800">My Assignments</h1>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
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
        
        <select
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
        </select>
        
        <select
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          {courses.map((course, index) => (
            <option key={index} value={course}>
              {course === 'all' ? 'All Courses' : course}
            </option>
          ))}
        </select>
        
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
                      {assignment.courseName}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                    {assignment.grade && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        Grade: {assignment.grade}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center">
                  <div className="flex items-center mr-6">
                    <Clock size={16} className={`mr-2 ${getDueDateColor(assignment.dueDate)}`} />
                    <div>
                      <div className="text-xs text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</div>
                      <div className={`text-xs font-medium ${getDueDateColor(assignment.dueDate)}`}>
                        {getDaysRemaining(assignment.dueDate)}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(assignment)}>
                    View Details
                  </Button>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Teacher: {assignment.teacherName}
                </div>
                
                {assignment.status !== 'Completed' && (
                  <div className="flex space-x-2">
                    {assignment.status === 'Not Started' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(assignment.id, 'In Progress')}
                      >
                        Start Working
                      </Button>
                    )}
                    
                    {assignment.status === 'In Progress' && (
                      <Button
                        variant="success"
                        size="sm"
                        icon={<CheckSquare size={16} />}
                        onClick={() => handleUpdateStatus(assignment.id, 'Completed')}
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                )}

                {assignment.status === 'Not Attempted' && (
                  <Button
                    variant="warning"
                    size="sm"
                    className="ml-2"
                    onClick={() => handleUpdateStatus(assignment.id, 'In Progress')}
                  >
                    Start Assignment
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search term.</p>
            </div>
          </Card>
        )}
      </div>
      
      {/* Assignment Details Modal */}
      {showDetailsModal && selectedAssignment && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowDetailsModal(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-auto p-6 animate-slide-up">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              onClick={() => setShowDetailsModal(false)}
            >
              <X size={24} />
            </button>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedAssignment.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {selectedAssignment.courseName}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAssignment.status)}`}>
                  {selectedAssignment.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Details</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-4">{selectedAssignment.description}</p>
                    <div className="text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-500">Teacher:</span>
                        <span className="text-gray-900">{selectedAssignment.teacherName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-500">Due Date:</span>
                        <span className={`text-gray-900 ${getDueDateColor(selectedAssignment.dueDate)}`}>
                          {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-500">Status:</span>
                        <span className="text-gray-900">{selectedAssignment.status}</span>
                      </div>
                      {selectedAssignment.grade && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium text-gray-500">Grade:</span>
                          <span className="text-gray-900">{selectedAssignment.grade}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                {selectedAssignment.feedback ? (
                  <>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Teacher Feedback</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-600">{selectedAssignment.feedback}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Actions</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      {selectedAssignment.status === 'Not Started' && (
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() => {
                            handleUpdateStatus(selectedAssignment.id, 'In Progress');
                          }}
                        >
                          Start Working on Assignment
                        </Button>
                      )}
                      
                      {selectedAssignment.status === 'In Progress' && (
                        <div className="space-y-3">
                          <Button
                            variant="primary"
                            className="w-full"
                          >
                            Upload Submission
                          </Button>
                          <Button
                            variant="success"
                            className="w-full"
                            onClick={() => {
                              handleUpdateStatus(selectedAssignment.id, 'Completed');
                            }}
                          >
                            Mark as Completed
                          </Button>
                        </div>
                      )}
                      
                      {(selectedAssignment.status === 'Completed' || selectedAssignment.status === 'Overdue') && !selectedAssignment.feedback && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">
                            {selectedAssignment.status === 'Completed' 
                              ? 'Waiting for teacher feedback.' 
                              : 'This assignment is past due.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;