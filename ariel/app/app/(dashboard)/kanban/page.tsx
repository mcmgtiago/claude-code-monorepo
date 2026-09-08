'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Lead {
  id: string;
  name: string;
  whatsapp_number: string;
  score: number;
  classification: string;
  data: Record<string, any>;
  created_at: string;
}

const COLUMNS = [
  { id: 'novo', title: '🆕 Novo', filter: (l: Lead) => !l.classification },
  { id: 'frio', title: '❄️ Frio', filter: (l: Lead) => l.classification === 'frio' },
  { id: 'morno', title: '🟡 Morno', filter: (l: Lead) => l.classification === 'morno' },
  { id: 'hot', title: '🔥 Hot', filter: (l: Lead) => l.classification === 'hot' },
];

export default function KanbanPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    const { data, error } = await supabase
      .from('ariel_contacts')
      .select('*')
      .eq('type', 'lead')
      .eq('status', 'active')
      .order('score', { ascending: false });

    if (!error && data) setLeads(data as Lead[]);
    setLoading(false);
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-400">Carregando funil...</div>;
  }

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Funil de Leads</h1>
        <p className="text-sm text-gray-500 mt-1">{leads.length} leads ativos</p>
      </div>

      <div className="flex gap-4 h-[calc(100%-80px)] overflow-x-auto">
        {COLUMNS.map((col) => {
          const columnLeads = leads.filter(col.filter);
          return (
            <div key={col.id} className="flex-shrink-0 w-72">
              <div className="bg-gray-100 rounded-xl p-3 h-full overflow-auto">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-semibold text-gray-700">{col.title}</h3>
                  <span className="text-xs bg-white text-gray-500 px-2 py-0.5 rounded-full">
                    {columnLeads.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow transition cursor-pointer"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {lead.name || lead.whatsapp_number}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          Score: {lead.score}
                        </span>
                        {lead.data?.tipo_empresa && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                            {lead.data.tipo_empresa}
                          </span>
                        )}
                      </div>
                      {lead.data?.faturamento_mensal && (
                        <p className="text-xs text-gray-400 mt-1">
                          R$ {(lead.data.faturamento_mensal / 1000).toFixed(0)}k/mês
                        </p>
                      )}
                    </div>
                  ))}

                  {columnLeads.length === 0 && (
                    <div className="text-center text-gray-300 text-xs py-8">
                      Nenhum lead
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
