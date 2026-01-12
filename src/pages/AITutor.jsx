import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';
import { 
  ArrowLeft, Send, Brain, Sparkles, Loader, 
  Plus, Trash2, MessageSquare, Clock, Zap, 
  Target, BookOpen, TrendingUp, X, Menu, ArrowDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

export default function AITutor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { persona } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      message: 'Halo! 👋 Aku AI Tutor kamu. Tanya apa aja yang pengen kamu pelajari atau diskusikan!',
      timestamp: new Date()
    }
  ]);
  const [sessionId, setSessionId] = useState(location.state?.sessionId || null);
  const [sessions, setSessions] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPersonaPanel, setShowPersonaPanel] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);
  
  useEffect(() => {
    loadSessions();
    loadChatHistory();
  }, []);
  
  const loadSessions = async () => {
    try {
      const data = await api.getChatSessions();
      console.log('Sessions loaded:', data);
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setSessions([]);
    }
  };
  
  const loadChatHistory = async () => {
    try {
      const sessionIdFromNav = location.state?.sessionId;
      if (!sessionIdFromNav) {
        return;
      }

      const data = await api.getChatHistory(sessionIdFromNav);
      if (data.history && data.history.length > 0) {
        setSessionId(data.history[0]?.session_id || sessionIdFromNav);
        setMessages(data.history.slice(-20).map(h => ({
          role: h.role,
          message: h.message,
          timestamp: new Date(h.created_at)
        })));
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };
  
  const handleNewChat = () => {
    setSessionId(null);
    setMessages([
      {
        role: 'assistant',
        message: 'Halo! 👋 Aku AI Tutor kamu. Tanya apa aja yang pengen kamu pelajari atau diskusikan!',
        timestamp: new Date()
      }
    ]);
  };
  
  const handleSelectSession = async (session) => {
    try {
      console.log('Loading session:', session.session_id);
      const data = await api.getChatHistory(session.session_id);
      console.log('Session history:', data);
      if (data.history && data.history.length > 0) {
        setSessionId(session.session_id);
        setMessages(data.history.map(h => ({
          role: h.role,
          message: h.message,
          timestamp: new Date(h.created_at)
        })));
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };
  
  const handleDeleteSession = async (sessionIdToDelete, e) => {
    e.stopPropagation();
    if (!confirm('Hapus percakapan ini?')) return;
    
    try {
      await api.deleteSession(sessionIdToDelete);
      setSessions(sessions.filter(s => s.session_id !== sessionIdToDelete));
      if (sessionId === sessionIdToDelete) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, {
      role: 'user',
      message: userMessage,
      timestamp: new Date()
    }]);
    
    setLoading(true);
    
    try {
      const currentSessionId = sessionId || null;
      const userTimeMeta = {
        local_time_iso: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offset_minutes: new Date().getTimezoneOffset(),
      };
      const response = await api.chatWithTutor(userMessage, currentSessionId, userTimeMeta);
      if (response.session_id && response.session_id !== sessionId) {
        setSessionId(response.session_id);
        loadSessions();
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        message: response.message,
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        message: `Maaf, terjadi error: ${err.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };
  
  const truncateMessage = (msg, maxLen = 50) => {
    return msg.length > maxLen ? msg.substring(0, maxLen) + '...' : msg;
  };
  
  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex overflow-hidden">
      {/* Sidebar - Chat History */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat History
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Chat Baru
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sessions.map((session) => (
            <div
              key={session.session_id}
              onClick={() => handleSelectSession(session)}
              className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-purple-50 ${
                sessionId === session.session_id ? 'bg-purple-100 border border-purple-300' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {truncateMessage(session.first_user_message || 'Chat tanpa judul')}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDate(session.last_message_at)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(session.session_id, e)}
                  className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada percakapan</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Dashboard
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">AI Tutor</h1>
                  <p className="text-xs text-gray-600">Always here to help</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Messages Area */}
          <main className="flex-1 overflow-y-auto px-4 py-6 relative" ref={messagesContainerRef} onScroll={handleScroll}>
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'bg-white border border-gray-200'
                  } rounded-2xl px-6 py-4 shadow-sm`}>
                    <div className="flex items-start gap-3">
                      {msg.role === 'assistant' && (
                        <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                          <Brain className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        {msg.role === 'user' ? (
                          <p className="text-sm mb-2 whitespace-pre-wrap text-white">
                            {msg.message}
                          </p>
                        ) : (
                          <div className="text-sm mb-2 prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-a:text-purple-600">
                            <ReactMarkdown
                              remarkPlugins={[remarkMath]}
                              rehypePlugins={[rehypeKatex, rehypeHighlight]}
                              components={{
                                code({node, inline, className, children, ...props}) {
                                  return inline ? (
                                    <code className="bg-purple-50 text-purple-600 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {msg.message}
                            </ReactMarkdown>
                          </div>
                        )}
                        <span className={`text-xs ${
                          msg.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Loader className="w-5 h-5 text-purple-600 animate-spin" />
                      </div>
                      <span className="text-gray-600">AI sedang berpikir...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Scroll to Bottom Button */}
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="fixed bottom-24 right-8 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all z-10 animate-bounce"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            )}
          </main>
          
          {/* Right Panel - Personalisasi */}
          <aside className={`${showPersonaPanel ? 'w-80' : 'w-0'} bg-white border-l border-gray-200 overflow-y-auto transition-all duration-300 flex-shrink-0`}>
            <div className="p-6 space-y-6">
              {/* Persona Info */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Profil Belajar
                  </h3>
                  <button onClick={() => setShowPersonaPanel(false)} className="lg:hidden">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {persona && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gaya Belajar:</span>
                      <span className="font-medium text-purple-600 capitalize">{persona.gaya_belajar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Learning Pace:</span>
                      <span className="font-medium text-purple-600 capitalize">{persona.learning_pace}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fokus Level:</span>
                      <span className="font-medium text-purple-600 capitalize">{persona.fokus_level}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quick Tips */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Tips Cepat
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Tanya konsep yang belum jelas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Minta contoh soal & pembahasan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Diskusi strategi belajar efektif</span>
                  </li>
                </ul>
              </div>
              
              {/* Suggested Topics */}
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3">💡 Topik Populer</h3>
                <div className="flex flex-wrap gap-2">
                  {['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Programming'].map(topic => (
                    <button
                      key={topic}
                      onClick={() => setInput(`Jelaskan konsep dasar ${topic}`)}
                      className="px-3 py-1.5 bg-white border border-green-200 rounded-lg text-sm text-gray-700 hover:bg-green-100 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
        
        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-4 py-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya apa aja ke AI Tutor..."
                className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

