/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { ChatSession, Message, ModelId } from './types';
import { streamChat, generateTitle } from './lib/gemini';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error("Failed to parse sessions from localStorage:", e);
    }
    return [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>('gemini-3.1-pro-preview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('nexus_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const startNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      modelId: selectedModel,
      createdAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, [selectedModel]);

  const handleSendMessage = async (content: string, attachments: string[]) => {
    let activeSessionId = currentSessionId;
    
    // Create new session if none exists
    if (!activeSessionId) {
      const newSession: ChatSession = {
        id: uuidv4(),
        title: content.slice(0, 30) || 'New Chat',
        messages: [],
        modelId: selectedModel,
        createdAt: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      activeSessionId = newSession.id;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    // Update session with user message
    setSessions(prev => prev.map(session => {
      if (session.id === activeSessionId) {
        return {
          ...session,
          title: session.messages.length === 0 ? content.slice(0, 40) || 'New Chat' : session.title,
          messages: [...session.messages, userMessage]
        };
      }
      return session;
    }));

    // Generate accurate title if it's the first message
    const isFirstMessage = !currentSession || currentSession.messages.length === 0;
    if (isFirstMessage) {
      generateTitle(content).then(title => {
        setSessions(prev => prev.map(session => 
          session.id === activeSessionId ? { ...session, title } : session
        ));
      });
    }

    setIsGenerating(true);

    try {
      // Simulate "Searching" delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      };

      // Add empty assistant message to start streaming into it
      setSessions(prev => prev.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, assistantMessage]
          };
        }
        return session;
      }));

      const sessionStore = sessions.find(s => s.id === activeSessionId);
      const history = sessionStore ? [...sessionStore.messages, userMessage] : [userMessage];
      
      let fullContent = '';
      const stream = streamChat(selectedModel, history);

      for await (const chunk of stream) {
        fullContent += chunk;
        setSessions(prev => prev.map(session => {
          if (session.id === activeSessionId) {
            const lastMsg = session.messages[session.messages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              return {
                ...session,
                messages: [
                  ...session.messages.slice(0, -1),
                  { ...lastMsg, content: fullContent }
                ]
              };
            }
          }
          return session;
        }));
      }
    } catch (error) {
      console.error("Failed to stream response:", error);
      // Handle error by adding an error message
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0D0D0D] text-zinc-100 selection:bg-purple-500/30 selection:text-white overflow-hidden relative">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          setIsSidebarOpen(false);
        }}
        onNewChat={() => {
          startNewChat();
          setIsSidebarOpen(false);
        }}
        onDeleteSession={deleteSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        <ChatArea 
          messages={currentSession?.messages || []}
          isGenerating={isGenerating}
          onSendMessage={handleSendMessage}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </main>
    </div>
  );
}

