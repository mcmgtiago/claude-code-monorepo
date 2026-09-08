'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

interface Obligation {
  id: string;
  obligation_type: string;
  due_date: string;
  status: string;
  estimated_value_cents: number | null;
  contacts: { name: string } | null;
}

export default function CalendarPage() {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadObligations();
  }, []);

  async function loadObligations() {
    const today = new Date().toISOString().split('T')[0];
    const in30days = new Date();
    in30days.setDate(in30days.getDate() + 30);

    const { data, error } = await supabase
      .from('ariel_fiscal_obligations')
      .select('*, contacts(name)')
      .in('status', ['pending', 'in_progress'])
      .gte('due_date', today)
      .lte('due_date', in30days.toISOString().split('T')[0])
      .order('due_date', { ascending: true });

    if (!error && data) setObligations(data as Obligation[]);
    setLoading(false);
  }

  // Agrupar por data
  const groupedByDate = obligations.reduce((acc, ob) => {
    const date = ob.due_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(ob);
    return acc;
  }, {} as Record<string, Obligation[]>);

  function getDaysUntil(date: string): number {
    return Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }

  function getUrgencyColor(daysUntil: number): string {
    if (daysUntil <= 1) return 'bg-red-100 border-red-300 text-red-800';
    if (daysUntil <= 3) return 'bg-orange-100 border-orange-300 text-orange-800';
    if (daysUntil <= 7) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-green-100 border-green-300 text-green-800';
  }

  const obligationLabels: Record<string, string> = {
    das_simples: 'DAS Simples',
    fgts: 'FGTS Digital',
    esocial: 'E-Social',
    dctf: 'DCTF',
    defis: 'DEFIS',
    irpf: 'IRPF',
    irrf: 'IRRF',
    inss: 'INSS',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📅 Compliance Fiscal</h1>
        <p className="text-sm text-gray-500 mt-1">
          {obligations.length} obrigações nos próximos 30 dias
        </p>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-2xl font-bold text-red-700">
            {obligations.filter((o) => getDaysUntil(o.due_date) <= 1).length}
          </p>
          <p className="text-xs text-red-600">Vence hoje/amanhã</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-2xl font-bold text-orange-700">
            {obligations.filter((o) => getDaysUntil(o.due_date) > 1 && getDaysUntil(o.due_date) <= 3).length}
          </p>
          <p className="text-xs text-orange-600">Em 2-3 dias</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-700">
            {obligations.filter((o) => getDaysUntil(o.due_date) > 3 && getDaysUntil(o.due_date) <= 7).length}
          </p>
          <p className="text-xs text-yellow-600">Esta semana</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-2xl font-bold text-green-700">
            {obligations.filter((o) => getDaysUntil(o.due_date) > 7).length}
          </p>
          <p className="text-xs text-green-600">Tranquilo (7+ dias)</p>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="text-center text-gray-400 py-8">Carregando...</div>
      ) : Object.keys(groupedByDate).length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-3xl mb-2">✅</p>
          <p>Nenhuma obrigação nos próximos 30 dias!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByDate).map(([date, obs]) => {
            const daysUntil = getDaysUntil(date);
            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {formatDate(date)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getUrgencyColor(daysUntil)}`}>
                    {daysUntil === 0 ? 'HOJE' : daysUntil === 1 ? 'Amanhã' : `em ${daysUntil} dias`}
                  </span>
                </div>
                <div className="space-y-2 ml-4">
                  {obs.map((ob) => (
                    <div
                      key={ob.id}
                      className={`border rounded-lg p-3 ${getUrgencyColor(daysUntil)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {obligationLabels[ob.obligation_type] || ob.obligation_type}
                          </p>
                          {ob.contacts?.name && (
                            <p className="text-xs opacity-70">👤 {ob.contacts.name}</p>
                          )}
                        </div>
                        {ob.estimated_value_cents && (
                          <span className="text-sm font-mono">
                            R$ {(ob.estimated_value_cents / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
