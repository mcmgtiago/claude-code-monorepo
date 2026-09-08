'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'done' | 'cancelled';
  due_date: string;
  source: string;
  contacts: { name: string } | null;
  created_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'open' | 'done' | 'all'>('open');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [filter]);

  async function loadTasks() {
    let query = supabase
      .from('ariel_tasks')
      .select('*, contacts(name)')
      .order('due_date', { ascending: true })
      .limit(50);

    if (filter === 'open') query = query.in('status', ['open', 'in_progress']);
    else if (filter === 'done') query = query.eq('status', 'done');

    const { data, error } = await query;
    if (!error && data) setTasks(data as Task[]);
    setLoading(false);
  }

  async function toggleTask(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'done' ? 'open' : 'done';
    await supabase.from('ariel_tasks').update({ status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null }).eq('id', taskId);
    loadTasks();
  }

  const priorityStyles = {
    urgent: 'border-l-red-500 bg-red-50',
    high: 'border-l-orange-500 bg-orange-50',
    normal: 'border-l-blue-500 bg-white',
    low: 'border-l-gray-300 bg-white',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tasks.filter((t) => t.status !== 'done').length} pendentes
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {(['open', 'done', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f === 'open' ? '📋 Pendentes' : f === 'done' ? '✅ Concluídas' : '📚 Todas'}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Carregando...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-3xl mb-2">🎉</p>
            <p>Nenhuma tarefa pendente!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`border-l-4 rounded-lg p-4 shadow-sm ${priorityStyles[task.priority]}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id, task.status)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                      task.status === 'done'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {task.status === 'done' && <span className="text-xs">✓</span>}
                  </button>
                  <div>
                    <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {task.contacts?.name && (
                        <span className="text-xs text-gray-400">👤 {task.contacts.name}</span>
                      )}
                      <span className="text-xs text-gray-400">via {task.source}</span>
                    </div>
                  </div>
                </div>
                {task.due_date && (
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    📅 {formatDate(task.due_date)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
