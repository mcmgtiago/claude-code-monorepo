'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';

interface Conversation {
  id: string;
  contact_id: string;
  status: string;
  assigned_agent: string;
  created_at: string;
  contacts: {
    name: string;
    whatsapp_number: string;
    type: string;
    classification: string;
    score: number;
    last_message_at: string;
  };
}

interface Message {
  id: string;
  direction: 'in' | 'out';
  content_text: string;
  content_type: string;
  agent_id: string;
  created_at: string;
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) loadMessages(selectedConv);
  }, [selectedConv]);

  async function loadConversations() {
    const { data, error } = await supabase
      .from('ariel_conversations')
      .select('*, contacts(name, whatsapp_number, type, classification, score, last_message_at)')
      .eq('status', 'open')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (!error && data) setConversations(data as any);
    setLoading(false);
  }

  async function loadMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('ariel_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!error && data) setMessages(data as Message[]);
  }

  const selectedContact = conversations.find((c) => c.id === selectedConv)?.contacts;

  return (
    <div className="flex h-full">
      {/* Lista de conversas */}
      <div className="w-80 border-r border-gray-200 bg-white overflow-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
          <p className="text-sm text-gray-500">{conversations.length} conversas abertas</p>
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-400">Carregando...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <p className="text-2xl mb-2">📭</p>
            <p>Nenhuma conversa ainda</p>
            <p className="text-xs mt-1">Quando alguém mandar mensagem no WhatsApp, aparece aqui</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv.id)}
                className={`w-full p-3 text-left hover:bg-gray-50 transition ${
                  selectedConv === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {conv.contacts?.name || conv.contacts?.whatsapp_number}
                  </span>
                  <span className="text-xs text-gray-400">
                    {conv.contacts?.last_message_at ? timeAgo(conv.contacts.last_message_at) : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    conv.contacts?.type === 'client' ? 'bg-green-100 text-green-700' :
                    conv.contacts?.classification === 'hot' ? 'bg-red-100 text-red-700' :
                    conv.contacts?.classification === 'morno' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {conv.contacts?.type === 'client' ? 'Cliente' :
                     conv.contacts?.classification || 'Lead'}
                  </span>
                  {conv.assigned_agent && (
                    <span className="text-xs text-gray-400">
                      via {conv.assigned_agent}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col bg-white">
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-2">💬</p>
              <p>Selecione uma conversa</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header do chat */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedContact?.name || selectedContact?.whatsapp_number}
                </h3>
                <p className="text-xs text-gray-500">
                  Score: {selectedContact?.score || 0} • {selectedContact?.classification || 'N/A'}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedContact?.type === 'client' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {selectedContact?.type === 'client' ? '✅ Cliente' : '🎯 Lead'}
              </span>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    msg.direction === 'out'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content_text || `[${msg.content_type}]`}</p>
                    <p className={`text-xs mt-1 ${msg.direction === 'out' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {timeAgo(msg.created_at)}
                      {msg.agent_id && ` • ${msg.agent_id}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
