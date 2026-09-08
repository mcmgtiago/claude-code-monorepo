'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  whatsapp_number: string;
  type: 'lead' | 'client' | 'lost';
  score: number;
  classification: string;
  data: Record<string, any>;
  last_message_at: string;
  created_at: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filter, setFilter] = useState<'all' | 'lead' | 'client'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, [filter]);

  async function loadContacts() {
    let query = supabase
      .from('ariel_contacts')
      .select('*')
      .order('last_message_at', { ascending: false })
      .limit(100);

    if (filter !== 'all') {
      query = query.eq('type', filter);
    }

    const { data, error } = await query;
    if (!error && data) setContacts(data as Contact[]);
    setLoading(false);
  }

  const stats = {
    total: contacts.length,
    leads: contacts.filter((c) => c.type === 'lead').length,
    clients: contacts.filter((c) => c.type === 'client').length,
    hot: contacts.filter((c) => c.classification === 'hot').length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contatos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.total} contatos • {stats.leads} leads • {stats.clients} clientes • {stats.hot} quentes
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {(['all', 'lead', 'client'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'lead' ? '🎯 Leads' : '✅ Clientes'}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Nome</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Tipo</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Score</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Regime</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Faturamento</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Última msg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center text-gray-400">Carregando...</td></tr>
            ) : contacts.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Nenhum contato encontrado</td></tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 transition cursor-pointer">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.name || 'Sem nome'}</p>
                      <p className="text-xs text-gray-400">{contact.whatsapp_number}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      contact.type === 'client' ? 'bg-green-100 text-green-700' :
                      contact.classification === 'hot' ? 'bg-red-100 text-red-700' :
                      contact.classification === 'morno' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {contact.type === 'client' ? 'Cliente' : contact.classification || 'Lead'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-gray-700">{contact.score}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {contact.data?.tipo_empresa || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {contact.data?.faturamento_mensal
                      ? formatCurrency(contact.data.faturamento_mensal * 100)
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {contact.last_message_at ? formatDate(contact.last_message_at) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
