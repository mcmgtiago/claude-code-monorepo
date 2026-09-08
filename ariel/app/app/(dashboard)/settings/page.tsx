'use client';

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">⚙️ Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Configurações do escritório</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dados do escritório */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Escritório</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase">Nome</label>
              <p className="text-sm font-medium text-gray-900">Escritório Demo Contábil</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Plano</label>
              <p className="text-sm font-medium text-gray-900">Professional (R$ 799/mês)</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">WhatsApp</label>
              <p className="text-sm font-medium text-gray-900">+55 11 99999-9999</p>
            </div>
          </div>
        </div>

        {/* Agentes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Agentes IA Ativos</h3>
          <div className="space-y-2">
            {[
              { name: 'Lead Qualification', status: 'ativo', agent: '01' },
              { name: 'Propostas', status: 'ativo', agent: '02' },
              { name: 'Customer Support', status: 'ativo', agent: '04' },
              { name: 'Documentos', status: 'ativo', agent: '07' },
              { name: 'Compliance', status: 'ativo', agent: '09' },
            ].map((a) => (
              <div key={a.agent} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">Agent {a.agent} — {a.name}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  ✅ {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Base de Conhecimento (FAQ)</h3>
          <p className="text-sm text-gray-500">
            8 artigos configurados para resposta automática.
          </p>
          <button className="mt-3 text-sm text-blue-600 font-medium hover:underline">
            Editar FAQ →
          </button>
        </div>

        {/* Integrações */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Integrações</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">WhatsApp (WAHA)</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Conectado</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Google Calendar</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Em breve</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Asaas (pagamentos)</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Em breve</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
