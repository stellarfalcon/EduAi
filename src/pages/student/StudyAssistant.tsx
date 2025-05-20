import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Bot, SendHorizonal, User, Book, Zap, FileText, RefreshCw, X, ArrowDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { generateAIResponse } from '../../api/ai';
import axios from 'axios';
import { API_URL } from '../../config/constants';

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

interface Tool {
  id: string;
  name: string;
  icon: JSX.Element;
  prompt: string;
}

const tools: Tool[] = [
  { id: 'qa', name: 'Homework Help', icon: <Book size={20} />, prompt: 'I need help with my homework about ' },
  { id: 'summarize', name: 'Summarize Text', icon: <FileText size={20} />, prompt: 'Please summarize the following text: ' },
  { id: 'explain', name: 'Explain Concept', icon: <Zap size={20} />, prompt: 'Can you explain this concept in simple terms: ' },
];

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
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/student/chat-history`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setChatHistory(
          response.data.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }))
        );
      } catch (error) {
        console.error('Error fetching chat history:', error);
        toast.error('Failed to load chat history');
      }
    };

    fetchChatHistory();
  }, []);

  const handleLoadHistory = async (historyId: string) => {
    try {
      const response = await axios.get(`${API_URL}/student/chat-history/${historyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMessages(
        response.data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      );
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history');
    }
  };

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
      const responseText = await generateAIResponse(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save to history if it's a new conversation
      if (messages.length <= 1) {
        const title = input.length > 25 ? input.substring(0, 25) + '...' : input;
        const newHistoryItem = {
          id: Date.now().toString(),
          title,
          timestamp: new Date(),
          preview: input,
        };
        
        // Save to backend
        await axios.post(
          `${API_URL}/student/chat-history`,
          newHistoryItem,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        setChatHistory(prev => [newHistoryItem, ...prev]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      const errorMsg = error.response?.data?.reason || error.message || 'Failed to send message. Please try again.';
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I cannot process that request: ${errorMsg}`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error(errorMsg);
    } finally {
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

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageContent = (content: string) => {
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({node, ...props}) => <p className="mt-2 first:mt-0 prose prose-sm max-w-none" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mt-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside mt-2" {...props} />,
          li: ({node, ...props}) => <li className="mt-1" {...props} />,
          code: ({inline, className, children, ...props}: any) => (
            inline 
              ? <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>{children}</code>
              : <code className="block bg-gray-100 p-2 rounded text-sm mt-2" {...props}>{children}</code>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    );
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
              >
                Send
              </Button>
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