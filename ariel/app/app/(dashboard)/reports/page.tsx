'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

interface Stats {
  totalContacts: number;
  totalLeads: number;
  totalClients: number;
  hotLeads: number;
  proposalsSent: number;
  proposalsAccepted: number;
  documentsProcessed: number;
  obligationsPending: number;
  mrr: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [contacts, leads, clients, hot, proposals, accepted, docs, obligations] = await Promise.all([
      supabase.from('ariel_contacts').select('id', { count: 'exact', head: true }),
      supabase.from('ariel_contacts').select('id', { count: 'exact', head: true }).eq('type', 'lead'),
      supabase.from('ariel_contacts').select('id', { count: 'exact', head: true }).eq('type', 'client'),
      supabase.from('ariel_contacts').select('id', { count: 'exact', head: true }).eq('classification', 'hot'),
      supabase.from('ariel_proposals').select('id', { count: 'exact', head: true }),
      supabase.from('ariel_proposals').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
      supabase.from('ariel_documents').select('id', { count: 'exact', head: true }),
      supabase.from('ariel_fiscal_obligations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    // MRR estimado (clientes × ticket médio)
    const clientCount = clients.count || 0;
    const mrr = clientCount * 60000; // R$ 600 médio

    setStats({
      totalContacts: contacts.count || 0,
      totalLeads: leads.count || 0,
      totalClients: clientCount,
      hotLeads: hot.count || 0,
      proposalsSent: proposals.count || 0,
      proposalsAccepted: accepted.count || 0,
      documentsProcessed: docs.count || 0,
      obligationsPending: obligations.count || 0,
      mrr,
    });
    setLoading(false);
  }

  if (loading) return <div className="p-6 text-center text-gray-400">Carregando métricas...</div>;
  if (!stats) return null;

  const conversionRate = stats.proposalsSent > 0
    ? ((stats.proposalsAccepted / stats.proposalsSent) * 100).toFixed(0)
    : '0';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📊 Relatórios</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral da operação</p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="MRR (estimado)"
          value={formatCurrency(stats.mrr)}
          icon="💰"
          color="blue"
        />
        <MetricCard
          label="Clientes ativos"
          value={String(stats.totalClients)}
          icon="✅"
          color="green"
        />
        <MetricCard
          label="Leads quentes"
          value={String(stats.hotLeads)}
          icon="🔥"
          color="red"
        />
        <MetricCard
          label="Conversão"
          value={`${conversionRate}%`}
          icon="🎯"
          color="purple"
        />
      </div>

      {/* Detalhamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Funil */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Funil de Vendas</h3>
          <div className="space-y-3">
            <FunnelRow label="Total contatos" value={stats.totalContacts} max={stats.totalContacts} color="bg-gray-300" />
            <FunnelRow label="Leads ativos" value={stats.totalLeads} max={stats.totalContacts} color="bg-blue-400" />
            <FunnelRow label="Leads quentes" value={stats.hotLeads} max={stats.totalContacts} color="bg-orange-400" />
            <FunnelRow label="Propostas enviadas" value={stats.proposalsSent} max={stats.totalContacts} color="bg-yellow-400" />
            <FunnelRow label="Propostas aceitas" value={stats.proposalsAccepted} max={stats.totalContacts} color="bg-green-400" />
            <FunnelRow label="Clientes" value={stats.totalClients} max={stats.totalContacts} color="bg-green-600" />
          </div>
        </div>

        {/* Operação */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Operação</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">📄 Documentos processados</span>
              <span className="text-sm font-semibold text-gray-900">{stats.documentsProcessed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">📅 Obrigações pendentes</span>
              <span className="text-sm font-semibold text-gray-900">{stats.obligationsPending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">🚨 Multas evitadas</span>
              <span className="text-sm font-semibold text-green-600">0 (meta!)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">⏱️ Horas economizadas (est.)</span>
              <span className="text-sm font-semibold text-blue-600">
                {Math.round(stats.documentsProcessed * 0.2)}h
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const bgColor = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
  }[color] || 'bg-gray-50 border-gray-200';

  return (
    <div className={`rounded-xl border p-4 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function FunnelRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const width = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-mono text-gray-700">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
