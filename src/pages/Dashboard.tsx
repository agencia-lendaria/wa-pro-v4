import React from 'react';
import { Send, Users, Calendar, BarChart } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statsData = [
  { name: 'Jan', envios: 1200, entregues: 1150 },
  { name: 'Fev', envios: 1900, entregues: 1800 },
  { name: 'Mar', envios: 2100, entregues: 2050 },
  { name: 'Abr', envios: 1800, entregues: 1750 },
  { name: 'Mai', envios: 2400, entregues: 2300 },
  { name: 'Jun', envios: 2200, entregues: 2100 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Total de Envios</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">12,436</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <Send className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">+12.5%</span>
            <span className="text-sm text-gray-500 ml-2">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Taxa de Entrega</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">94.2%</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <BarChart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">+2.1%</span>
            <span className="text-sm text-gray-500 ml-2">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Contatos Ativos</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">1,847</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">+8.2%</span>
            <span className="text-sm text-gray-500 ml-2">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Campanhas Ativas</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">23</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-red-600">-5.4%</span>
            <span className="text-sm text-gray-500 ml-2">vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Envios vs Entregas</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={statsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="envios" fill="#3B82F6" />
              <Bar dataKey="entregues" fill="#10B981" />
            </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campanhas Recentes</h3>
          <div className="space-y-4">
            {[
              { name: 'Promoção Black Friday', status: 'Concluída', sent: 1240, delivered: 1180 },
              { name: 'Follow-up Clientes', status: 'Em Andamento', sent: 340, delivered: 325 },
              { name: 'Newsletter Semanal', status: 'Agendada', sent: 0, delivered: 0 },
              { name: 'Lançamento Produto', status: 'Concluída', sent: 890, delivered: 842 },
            ].map((campaign, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 truncate">{campaign.name}</h4>
                  <p className="text-sm text-gray-600">
                    {campaign.sent > 0 ? `${campaign.sent} enviadas, ${campaign.delivered} entregues` : 'Aguardando execução'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium self-start sm:self-center whitespace-nowrap ${
                  campaign.status === 'Concluída' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};