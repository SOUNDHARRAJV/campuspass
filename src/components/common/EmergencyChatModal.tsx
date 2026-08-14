import React, { useState } from 'react';
import { GlassModal } from '../ui/GlassModal';
import {
  MessageSquare,
  Send,
  Phone,
  UserCheck,
  Shield,
  Building
} from 'lucide-react';

interface EmergencyChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'student' | 'authority';
  senderName: string;
  text: string;
  timestamp: string;
}

export const EmergencyChatModal: React.FC<EmergencyChatModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedContact, setSelectedContact] = useState<'dean' | 'warden' | 'admin' | 'security'>('dean');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    dean: [
      {
        id: '1',
        sender: 'authority',
        senderName: 'Dean of Student Affairs',
        text: 'Hello, this is Dean Office desk. How can I assist you with your campus pass or emergency leave today?',
        timestamp: '10:00 AM'
      }
    ],
    warden: [
      {
        id: '1',
        sender: 'authority',
        senderName: 'Hostel Chief Warden',
        text: 'Hostel Warden Office active. For night outpass or hostel clearance queries, message here or call hotline.',
        timestamp: '09:45 AM'
      }
    ],
    admin: [
      {
        id: '1',
        sender: 'authority',
        senderName: 'System Administrator',
        text: 'CampusPass System Admin. Report system glitches, registration errors, or account issues.',
        timestamp: '08:30 AM'
      }
    ],
    security: [
      {
        id: '1',
        sender: 'authority',
        senderName: 'Main Gate Security Control',
        text: 'Gate Security Inspector online. Please present active QR pass or state your Pass ID if scanner fails.',
        timestamp: '07:15 AM'
      }
    ]
  });

  const contacts = [
    {
      id: 'dean',
      title: 'Dean of Student Affairs',
      subtitle: 'Dr. S. K. Narayanan',
      icon: UserCheck,
      phone: '+91 98765 43210',
      badge: 'Online',
      color: 'bg-[#1e40af] text-white'
    },
    {
      id: 'warden',
      title: 'Hostel Chief Warden',
      subtitle: 'Prof. M. Ramesh',
      icon: Building,
      phone: '+91 98765 43211',
      badge: 'Active',
      color: 'bg-indigo-600 text-white'
    },
    {
      id: 'admin',
      title: 'System Administrator',
      subtitle: 'CampusPass Admin Desk',
      icon: Shield,
      phone: '+91 98765 43212',
      badge: 'Online',
      color: 'bg-slate-800 text-white'
    },
    {
      id: 'security',
      title: 'Gate Security Desk',
      subtitle: 'Inspector R. Selvam',
      icon: Shield,
      phone: '+91 98765 43213',
      badge: '24/7 Desk',
      color: 'bg-blue-600 text-white'
    }
  ];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsgText = inputMessage;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'student',
      senderName: 'SOUNDHAR RAJ V',
      text: userMsgText,
      timestamp: now
    };

    setMessages(prev => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), newMsg]
    }));

    setInputMessage('');

    setTimeout(() => {
      const currentContactObj = contacts.find(c => c.id === selectedContact);
      let replyText = `Your message has been logged by ${currentContactObj?.title}. We are reviewing your leave request now.`;

      if (userMsgText.toLowerCase().includes('emergency') || userMsgText.toLowerCase().includes('urgent')) {
        replyText = `⚠️ High Priority Alert received! ${currentContactObj?.subtitle} has been notified for immediate fast-track approval.`;
      } else if (userMsgText.toLowerCase().includes('qr') || userMsgText.toLowerCase().includes('gate')) {
        replyText = `Gate Security has updated pass verification status. Show OTP 4829 to inspector at gate.`;
      }

      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'authority',
        senderName: currentContactObj?.title || 'Authority',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => ({
        ...prev,
        [selectedContact]: [...(prev[selectedContact] || []), replyMsg]
      }));
    }, 1000);
  };

  const currentContactObj = contacts.find(c => c.id === selectedContact) || contacts[0];
  const currentChatList = messages[selectedContact] || [];

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Direct Authority Chat & Emergency Contacts"
      maxWidth="3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-[#172033] font-sans">
        {/* Left Column: Authority Contacts Selection */}
        <div className="space-y-2 md:border-r md:border-slate-200 md:pr-3">
          <p className="text-xs font-bold text-[#5b6472] uppercase tracking-wider mb-2">
            Select Authority Desk
          </p>
          {contacts.map(c => {
            const Icon = c.icon;
            const isSelected = selectedContact === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedContact(c.id as any)}
                className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start space-x-3 ${
                  isSelected
                    ? 'bg-[#1e40af] text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#172033] border border-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-white/20 text-white' : c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="truncate flex-1">
                  <p className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-[#172033]'}`}>
                    {c.title}
                  </p>
                  <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-[#5b6472]'}`}>
                    {c.subtitle}
                  </p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-1.5 inline-block ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {c.badge}
                  </span>
                </div>
              </button>
            );
          })}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4 space-y-1">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <Phone className="w-4 h-4 text-amber-700" />
              <span>Campus Helpline</span>
            </div>
            <p className="text-xs text-amber-900">
              Direct Phone: <a href={`tel:${currentContactObj.phone}`} className="font-bold underline">{currentContactObj.phone}</a>
            </p>
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="md:col-span-2 flex flex-col h-[55vh] min-h-[380px] md:h-[420px] bg-slate-50 rounded-xl border border-slate-200 p-4">
          {/* Active Contact Header */}
          <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-3 min-w-0">
              <div className={`p-2 rounded-lg ${currentContactObj.color}`}>
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#172033]">{currentContactObj.title}</h4>
                <p className="text-xs text-[#5b6472]">{currentContactObj.subtitle} • {currentContactObj.phone}</p>
              </div>
            </div>
            <a
              href={`tel:${currentContactObj.phone}`}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>Call Hotline</span>
            </a>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto my-3 space-y-3 p-2 custom-scrollbar">
            {currentChatList.map(msg => {
              const isStudent = msg.sender === 'student';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-xs font-semibold text-[#5b6472] px-1 mb-1">
                    {msg.senderName} • {msg.timestamp}
                  </span>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-xl text-sm font-medium leading-relaxed ${
                      isStudent
                        ? 'bg-[#1e40af] text-white rounded-br-none shadow-xs'
                        : 'bg-white text-[#172033] border border-slate-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Reply Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs custom-scrollbar">
            <button
              onClick={() => setInputMessage('Urgent: Need fast-track approval for emergency exit.')}
              className="bg-blue-50 hover:bg-blue-100 text-[#1e40af] border border-blue-200 px-3 py-1 rounded-full whitespace-nowrap font-bold"
            >
              ⚡ Fast-track Emergency
            </button>
            <button
              onClick={() => setInputMessage('My parent has confirmed consent. Please verify.')}
              className="bg-slate-100 hover:bg-slate-200 text-[#172033] px-3 py-1 rounded-full whitespace-nowrap font-semibold"
            >
              Check Parent Consent
            </button>
            <button
              onClick={() => setInputMessage('Gate scanner failed to read QR pass.')}
              className="bg-slate-100 hover:bg-slate-200 text-[#172033] px-3 py-1 rounded-full whitespace-nowrap font-semibold"
            >
              Gate QR Issue
            </button>
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder={`Message ${currentContactObj.title}...`}
              className="flex-1 h-12 bg-white border border-slate-300 text-[#172033] placeholder-slate-400 text-sm sm:text-base rounded-lg px-4 focus:outline-none focus:border-blue-600 font-medium"
            />
            <button
              type="submit"
              className="h-12 w-12 bg-[#1e40af] hover:bg-blue-800 text-white rounded-lg shadow-xs transition-colors flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </GlassModal>
  );
};
