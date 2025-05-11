import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

interface Teacher {
  user_id: number;
  email: string;
  full_name: string;
}

interface Class {
  class_id: number;
  class_name: string;
}

interface Course {
  course_id: number;
  course_name: string;
}

interface Assignment {
  id: number;
  class_id: number;
  course_id: number;
  teacher_id: number;
  start_date: string;
  end_date: string;
  class_name: string;
  course_name: string;
}

const TeacherAssignments = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Record<number, Assignment[]>>({});
  const [form, setForm] = useState<Record<number, { classId: string; courseId: string; startDate: string; endDate: string }>>({});
  const [editAssignment, setEditAssignment] = useState<{ [id: number]: Partial<Assignment> }>({});

  // Debug log: log teachers state on every render
  console.log('Teachers state in render:', teachers);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/teacher-assignments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Fetched assignments from backend:', res.data); // Debug log
      // Group assignments by teacher_id
      const grouped: Record<number, Assignment[]> = {};
      res.data.forEach((a: Assignment) => {
        if (!grouped[a.teacher_id]) grouped[a.teacher_id] = [];
        grouped[a.teacher_id].push(a);
      });
      console.log('Grouped assignments by teacher_id:', grouped); // Debug log
      setAssignments(grouped);
    } catch (error) {
      // ignore for now
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all teachers
        const usersRes = await axios.get(`${API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('Fetched users:', usersRes.data); // Debug log
        const teachers = usersRes.data.filter((u: any) => u.role === 'teacher' && (u.user_status === 1 || u.user_status === '1'));
        console.log('Teachers array after filter:', teachers); // Debug log
        setTeachers(teachers);

        // Fetch all classes
        const classesRes = await axios.get(`${API_URL}/admin/classes`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setClasses(classesRes.data);

        // Fetch all courses
        const coursesRes = await axios.get(`${API_URL}/admin/courses`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setCourses(coursesRes.data);
      } catch (error: any) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [teachers]);

  const handleAssign = async (teacherId: number) => {
    const { classId, courseId, startDate, endDate } = form[teacherId] || {};
    if (!classId || !courseId || !startDate || !endDate) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await axios.post(`${API_URL}/admin/assign-teacher`, {
        teacherId,
        classId,
        courseId,
        startDate,
        endDate
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Assignment successful');
      setForm(f => ({ ...f, [teacherId]: { classId: '', courseId: '', startDate: '', endDate: '' } }));
      await fetchAssignments();
    } catch (error) {
      toast.error('Failed to assign');
    }
  };

  const handleRemove = async (assignmentId: number) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return;
    try {
      await axios.delete(`${API_URL}/admin/teacher-assignments/${assignmentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Assignment removed');
      await fetchAssignments();
    } catch (error) {
      toast.error('Failed to remove assignment');
    }
  };

  const handleEditChange = (id: number, field: keyof Assignment, value: string | number) => {
    setEditAssignment(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleEditSave = async (a: Assignment) => {
    const edit = editAssignment[a.id] || {};
    try {
      await axios.put(`${API_URL}/admin/teacher-assignments/${a.id}`, {
        classId: edit.class_id ?? a.class_id,
        courseId: edit.course_id ?? a.course_id,
        teacherId: a.teacher_id,
        startDate: edit.start_date ?? a.start_date,
        endDate: edit.end_date ?? a.end_date
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Assignment updated');
      setEditAssignment(prev => { const p = { ...prev }; delete p[a.id]; return p; });
      await fetchAssignments();
    } catch (error) {
      toast.error('Failed to update assignment');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Teacher Class Allocation</h1>
      {loading ? (
        <div className="flex items-center justify-center h-full">Loading...</div>
      ) : (
        <Card>
          <div className="space-y-8">
            {teachers.map(teacher => (
              <div key={teacher.user_id} className="border-b pb-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-lg">{teacher.full_name || teacher.email}</div>
                    <div className="text-sm text-gray-500">{teacher.email}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 items-end mb-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={form[teacher.user_id]?.classId || ''}
                    onChange={e => setForm(f => ({ ...f, [teacher.user_id]: { ...f[teacher.user_id], classId: e.target.value } }))}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
                    ))}
                  </select>
                  <select
                    className="border rounded px-2 py-1"
                    value={form[teacher.user_id]?.courseId || ''}
                    onChange={e => setForm(f => ({ ...f, [teacher.user_id]: { ...f[teacher.user_id], courseId: e.target.value } }))}
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>{course.course_name}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    value={form[teacher.user_id]?.startDate || ''}
                    onChange={e => setForm(f => ({ ...f, [teacher.user_id]: { ...f[teacher.user_id], startDate: e.target.value } }))}
                  />
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    value={form[teacher.user_id]?.endDate || ''}
                    onChange={e => setForm(f => ({ ...f, [teacher.user_id]: { ...f[teacher.user_id], endDate: e.target.value } }))}
                  />
                  <Button size="sm" variant="primary" onClick={() => handleAssign(teacher.user_id)}>
                    Allocate
                  </Button>
                </div>
                <div>
                  <div className="font-medium mb-1">Current Allocations:</div>
                  {assignments[teacher.user_id]?.length ? (
                    <ul className="space-y-2">
                      {assignments[teacher.user_id].map(a => (
                        <li key={a.id} className="p-3 bg-gray-50 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between">
                          {editAssignment[a.id] ? (
                            <>
                              <select
                                className="border rounded px-1 py-0.5"
                                value={editAssignment[a.id].class_id ?? a.class_id}
                                onChange={e => handleEditChange(a.id, 'class_id', Number(e.target.value))}
                              >
                                {classes.map(cls => (
                                  <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
                                ))}
                              </select>
                              <select
                                className="border rounded px-1 py-0.5"
                                value={editAssignment[a.id].course_id ?? a.course_id}
                                onChange={e => handleEditChange(a.id, 'course_id', Number(e.target.value))}
                              >
                                {courses.map(course => (
                                  <option key={course.course_id} value={course.course_id}>{course.course_name}</option>
                                ))}
                              </select>
                              <input
                                type="date"
                                className="border rounded px-1 py-0.5"
                                value={editAssignment[a.id].start_date ?? a.start_date}
                                onChange={e => handleEditChange(a.id, 'start_date', e.target.value)}
                              />
                              <input
                                type="date"
                                className="border rounded px-1 py-0.5"
                                value={editAssignment[a.id].end_date ?? a.end_date}
                                onChange={e => handleEditChange(a.id, 'end_date', e.target.value)}
                              />
                              <Button size="sm" variant="success" onClick={() => handleEditSave(a)}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditAssignment(prev => { const p = { ...prev }; delete p[a.id]; return p; })}>Cancel</Button>
                            </>
                          ) : (
                            <>
                              <div>
                                <div><span className="font-semibold">Class:</span> {a.class_name}</div>
                                <div><span className="font-semibold">Course:</span> {a.course_name}</div>
                                <div><span className="font-semibold">Start:</span> {new Date(a.start_date).toLocaleDateString()}</div>
                                <div><span className="font-semibold">End:</span> {new Date(a.end_date).toLocaleDateString()}</div>
                              </div>
                              <div className="mt-2 md:mt-0 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setEditAssignment(prev => ({ ...prev, [a.id]: {} }))}>Edit</Button>
                                <Button size="sm" variant="danger" onClick={() => handleRemove(a.id)}>Remove</Button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-400 text-sm">No allocations</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TeacherAssignments; 