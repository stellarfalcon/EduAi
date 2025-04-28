import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { Save, Book, Layers, BrainCircuit, Rocket, Calendar, CalendarDays } from 'lucide-react';

interface LessonPlan {
  id: number;
  title: string;
  subject: string;
  gradeLevel: string;
  duration: string;
  objectives: string[];
  materials: string[];
  activities: { title: string; description: string; duration: string }[];
  assessment: string;
  created_at: string;
}

const LessonPlanner = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([
    {
      id: 1,
      title: 'Introduction to Photosynthesis',
      subject: 'Biology',
      gradeLevel: '9th Grade',
      duration: '45 minutes',
      objectives: [
        'Explain the basic process of photosynthesis',
        'Identify the key components involved in photosynthesis',
        'Describe how light energy is converted to chemical energy',
      ],
      materials: [
        'Photosynthesis diagram handouts',
        'Plant specimens',
        'Microscope slides of leaf cross-sections',
        'Interactive whiteboard',
      ],
      activities: [
        {
          title: 'Opening Discussion',
          description: 'Begin with a discussion about how plants obtain energy compared to animals.',
          duration: '10 minutes',
        },
        {
          title: 'Visual Presentation',
          description: 'Present the process of photosynthesis using diagrams and animations.',
          duration: '15 minutes',
        },
        {
          title: 'Group Activity',
          description: 'Students work in groups to label diagrams and discuss the process.',
          duration: '15 minutes',
        },
      ],
      assessment: 'Students will complete a short quiz on the basic concepts of photosynthesis and create a simple diagram explaining the process.',
      created_at: '2025-02-28T14:23:45Z',
    },
    {
      id: 2,
      title: 'Understanding Fractions',
      subject: 'Mathematics',
      gradeLevel: '4th Grade',
      duration: '60 minutes',
      objectives: [
        'Identify fractions as parts of a whole',
        'Compare fractions with like denominators',
        'Represent fractions using visual models',
      ],
      materials: [
        'Fraction manipulatives',
        'Fraction worksheets',
        'Colored paper for visual representations',
        'Interactive fraction games',
      ],
      activities: [
        {
          title: 'Introduction to Fractions',
          description: 'Use visual examples to introduce fractions as parts of a whole.',
          duration: '15 minutes',
        },
        {
          title: 'Hands-on Practice',
          description: 'Students use manipulatives to create and identify fractions.',
          duration: '20 minutes',
        },
        {
          title: 'Fraction Comparison Game',
          description: 'Students play a game to compare fractions with the same denominator.',
          duration: '20 minutes',
        },
      ],
      assessment: 'Students will complete a worksheet identifying fractions and comparing fractions with like denominators.',
      created_at: '2025-03-01T09:15:30Z',
    },
  ]);
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    gradeLevel: '',
    topic: '',
    duration: '45',
    standards: '',
    additionalNotes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateLessonPlan = async () => {
    try {
      setIsGenerating(true);
      // In a real application, this would make an API call to an AI service
      // For this demo, we'll simulate a delay and then show a success message
      
      setTimeout(() => {
        const newLessonPlan: LessonPlan = {
          id: Date.now(),
          title: `Lesson on ${formData.topic}`,
          subject: formData.subject,
          gradeLevel: formData.gradeLevel,
          duration: `${formData.duration} minutes`,
          objectives: [
            `Understand key concepts of ${formData.topic}`,
            'Apply learned concepts to real-world situations',
            'Develop critical thinking skills related to the subject',
          ],
          materials: [
            'Textbooks and reference materials',
            'Interactive worksheets',
            'Visual aids and presentations',
            'Assessment tools',
          ],
          activities: [
            {
              title: 'Introduction and Background',
              description: `Introduce students to ${formData.topic} with background information and context.`,
              duration: '15 minutes',
            },
            {
              title: 'Main Concept Exploration',
              description: 'Guide students through the core concepts with examples and demonstrations.',
              duration: '20 minutes',
            },
            {
              title: 'Practice and Application',
              description: 'Students work individually or in groups to apply concepts through activities or problems.',
              duration: '15 minutes',
            },
          ],
          assessment: 'Students will demonstrate understanding through a combination of discussion participation, activity completion, and a short exit assessment.',
          created_at: new Date().toISOString(),
        };
        
        setLessonPlans(prev => [newLessonPlan, ...prev]);
        setActiveTab('saved');
        setIsGenerating(false);
        toast.success('Lesson plan generated successfully!');
      }, 2000);
      
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast.error('Failed to generate lesson plan. Please try again.');
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lesson Planner</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('create')}
            >
              <div className="flex items-center">
                <Book className="mr-2" size={18} />
                Create New Lesson
              </div>
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'saved'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('saved')}
            >
              <div className="flex items-center">
                <Layers className="mr-2" size={18} />
                Saved Lessons
              </div>
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'create' ? (
            <div className="space-y-6">
              <div className="bg-secondary-50 border border-secondary-100 p-4 rounded-md mb-6">
                <div className="flex items-start">
                  <BrainCircuit className="text-secondary-500 mr-3 mt-1" size={24} />
                  <div>
                    <h3 className="font-medium text-secondary-700">AI-Powered Lesson Planning</h3>
                    <p className="text-secondary-600 text-sm mt-1">
                      Fill out the form below, and the AI will generate a comprehensive lesson plan based on your inputs.
                      You can then review and customize it to fit your teaching style and classroom needs.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Language Arts">Language Arts</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Art">Art</option>
                    <option value="Music">Music</option>
                    <option value="Physical Education">Physical Education</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level
                  </label>
                  <select
                    id="gradeLevel"
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a grade level</option>
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="1st Grade">1st Grade</option>
                    <option value="2nd Grade">2nd Grade</option>
                    <option value="3rd Grade">3rd Grade</option>
                    <option value="4th Grade">4th Grade</option>
                    <option value="5th Grade">5th Grade</option>
                    <option value="6th Grade">6th Grade</option>
                    <option value="7th Grade">7th Grade</option>
                    <option value="8th Grade">8th Grade</option>
                    <option value="9th Grade">9th Grade</option>
                    <option value="10th Grade">10th Grade</option>
                    <option value="11th Grade">11th Grade</option>
                    <option value="12th Grade">12th Grade</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Topic
                  </label>
                  <input
                    type="text"
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="E.g., Photosynthesis, Fractions, Shakespeare's Sonnets"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="15"
                    max="120"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="standards" className="block text-sm font-medium text-gray-700 mb-1">
                    Learning Standards (optional)
                  </label>
                  <input
                    type="text"
                    id="standards"
                    name="standards"
                    value={formData.standards}
                    onChange={handleInputChange}
                    placeholder="E.g., NGSS LS1-1, Common Core Math 4.NF.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (optional)
                  </label>
                  <textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Any specific requirements, student needs, or preferred teaching methods..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  isLoading={isGenerating}
                  icon={<Rocket size={18} />}
                  onClick={handleGenerateLessonPlan}
                  disabled={!formData.subject || !formData.gradeLevel || !formData.topic}
                >
                  Generate Lesson Plan
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Your Saved Lesson Plans</h2>
              
              {lessonPlans.length > 0 ? (
                <div className="space-y-6">
                  {lessonPlans.map((plan) => (
                    <Card key={plan.id} className="hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{plan.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {plan.subject}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                              {plan.gradeLevel}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <Calendar size={12} className="mr-1" />
                              {plan.duration}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 flex items-center">
                          <span className="text-xs text-gray-500 mr-4 flex items-center">
                            <CalendarDays size={12} className="mr-1" />
                            Created: {formatDate(plan.created_at)}
                          </span>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">Objectives:</h4>
                        <ul className="mt-1 text-sm text-gray-600 list-disc list-inside space-y-1">
                          {plan.objectives.map((objective, index) => (
                            <li key={index}>{objective}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">Activities:</h4>
                        <div className="mt-2 space-y-3">
                          {plan.activities.map((activity, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{activity.title} ({activity.duration})</div>
                              <div className="text-gray-600">{activity.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-md">
                  <Book className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No lesson plans yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating your first AI-generated lesson plan.</p>
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setActiveTab('create')}
                    >
                      Create New Lesson Plan
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanner;