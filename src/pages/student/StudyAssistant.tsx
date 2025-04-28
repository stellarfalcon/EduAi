import { useState } from 'react';
import { toast } from 'react-toastify';
import { Bot, SendHorizonal, User, Book, Zap, FileText, RefreshCw, Copy, Check, ArrowDown } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HistoryItem {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

const StudyAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI study assistant. How can I help you with your studies today?',
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([
    {
      id: '1',
      title: 'Photosynthesis Process',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      preview: 'Can you explain the photosynthesis process?',
    },
    {
      id: '2',
      title: 'Quadratic Equations',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      preview: 'How do I solve quadratic equations?',
    },
  ]);
  
  const tools = [
    { id: 'qa', name: 'Homework Help', icon: <Book size={20} />, prompt: 'I need help with my homework about ' },
    { id: 'summarize', name: 'Summarize Text', icon: <FileText size={20} />, prompt: 'Please summarize the following text: ' },
    { id: 'explain', name: 'Explain Concept', icon: <Zap size={20} />, prompt: 'Can you explain this concept in simple terms: ' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      // In a real application, this would make an API call to an AI service
      
      // Simulate AI response
      setTimeout(() => {
        let responseText = '';
        
        if (input.toLowerCase().includes('photosynthesis')) {
          responseText = 'Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. During photosynthesis, plants take in carbon dioxide (CO2) and water (H2O) from the air and soil. Within the plant cell, the water is oxidized, meaning it loses electrons, while the carbon dioxide is reduced, meaning it gains electrons. This transforms the water into oxygen and the carbon dioxide into glucose (a simple sugar). The plant then releases the oxygen back into the air, and stores energy as glucose molecules. The equation for photosynthesis is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2';
        } else if (input.toLowerCase().includes('quadratic')) {
          responseText = 'A quadratic equation has the form ax² + bx + c = 0 where a ≠ 0. To solve a quadratic equation, you can use the quadratic formula:\n\nx = (-b ± √(b² - 4ac)) / 2a\n\nWhere:\n- a, b, and c are the coefficients in the equation\n- The ± symbol indicates that there are two solutions: one with addition and one with subtraction\n\nFor example, to solve x² + 5x + 6 = 0:\na = 1, b = 5, c = 6\n\nx = (-5 ± √(25 - 24)) / 2\nx = (-5 ± √1) / 2\nx = (-5 ± 1) / 2\n\nSo x = -3 or x = -2';
        } else {
          responseText = 'I\'d be happy to help with that! Could you provide more details or specific questions about the topic? This will help me give you the most relevant and helpful information.';
        }
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
        
        // Add to history if it's a new conversation
        if (messages.length <= 1) {
          const title = input.length > 25 ? input.substring(0, 25) + '...' : input;
          setChatHistory(prev => [{
            id: Date.now().toString(),
            title,
            timestamp: new Date(),
            preview: input,
          }, ...prev]);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleToolSelect = (toolPrompt: string) => {
    setInput(toolPrompt);
    setSelectedTool(null);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Hello! I\'m your AI study assistant. How can I help you with your studies today?',
        timestamp: new Date(),
      },
    ]);
  };

  const handleLoadHistory = (historyId: string) => {
    // In a real application, this would load the conversation from history
    const history = chatHistory.find(h => h.id === historyId);
    
    if (history) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your AI study assistant. How can I help you with your studies today?',
          timestamp: new Date(history.timestamp),
        },
        {
          id: '2',
          role: 'user',
          content: history.preview,
          timestamp: new Date(history.timestamp),
        },
        {
          id: '3',
          role: 'assistant',
          content: history.id === '1' 
            ? 'Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. During photosynthesis, plants take in carbon dioxide (CO2) and water (H2O) from the air and soil. Within the plant cell, the water is oxidized, meaning it loses electrons, while the carbon dioxide is reduced, meaning it gains electrons. This transforms the water into oxygen and the carbon dioxide into glucose (a simple sugar). The plant then releases the oxygen back into the air, and stores energy as glucose molecules. The equation for photosynthesis is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2'
            : 'A quadratic equation has the form ax² + bx + c = 0 where a ≠ 0. To solve a quadratic equation, you can use the quadratic formula:\n\nx = (-b ± √(b² - 4ac)) / 2a\n\nWhere:\n- a, b, and c are the coefficients in the equation\n- The ± symbol indicates that there are two solutions: one with addition and one with subtraction\n\nFor example, to solve x² + 5x + 6 = 0:\na = 1, b = 5, c = 6\n\nx = (-5 ± √(25 - 24)) / 2\nx = (-5 ± √1) / 2\nx = (-5 ± 1) / 2\n\nSo x = -3 or x = -2',
          timestamp: new Date(history.timestamp.getTime() + 2000),
        },
      ]);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => (
      <p key={i} className={i > 0 ? 'mt-2' : ''}>
        {line}
      </p>
    ));
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <Button
                variant="primary"
                className="w-full"
                icon={<RefreshCw size={16} />}
                onClick={handleNewChat}
              >
                New Conversation
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">AI Tools</h3>
                <div className="space-y-2">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      className="w-full flex items-center p-2 rounded-md text-left hover:bg-gray-100 transition-colors"
                      onClick={() => handleToolSelect(tool.prompt)}
                    >
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-700 mr-3">
                        {tool.icon}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">History</h3>
                {chatHistory.length > 0 ? (
                  <div className="space-y-2">
                    {chatHistory.map((item) => (
                      <button
                        key={item.id}
                        className="w-full flex items-start p-2 rounded-md text-left hover:bg-gray-100 transition-colors"
                        onClick={() => handleLoadHistory(item.id)}
                      >
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 mr-3">
                          <Book size={16} />
                        </span>
                        <div className="overflow-hidden">
                          <div className="text-sm font-medium text-gray-700 truncate">{item.title}</div>
                          <div className="text-xs text-gray-500">{item.timestamp.toLocaleDateString()}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">No history yet</div>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <Bot size={20} className="text-primary-700" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">AI Study Assistant</h2>
                <p className="text-xs text-gray-500">Powered by AI</p>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              All interactions are logged for teacher review
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-primary-100 text-primary-700 ml-3' 
                      : 'bg-secondary-100 text-secondary-700 mr-3'
                  }`}>
                    {message.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="text-sm">
                      {formatMessageContent(message.content)}
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-secondary-100 text-secondary-700 mr-3">
                    <Bot size={14} />
                  </div>
                  
                  <div className="rounded-lg p-3 bg-gray-100 text-gray-900">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div id="chat-end" className="h-4"></div>
          </div>
          
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ask any study-related question..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isProcessing}
                />
                {selectedTool && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setSelectedTool(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                variant="primary"
                icon={<SendHorizonal size={18} />}
                isLoading={isProcessing}
                disabled={!input.trim() || isProcessing}
              />
            </form>
            
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-center">
              <ArrowDown size={12} className="mr-1" />
              <span>Scroll down for more conversation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyAssistant;