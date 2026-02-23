import React, { useEffect, useState } from 'react';
import { useCrmStore } from '../../store/crmStore';
import { useMessageStore } from '../../store/messageStore';
import { STAGE_CONFIG, STAGE_ORDER, PRIORITY_CONFIG, AccountStage, CrmAccount } from '../../types/crm';
import CrmKanbanBoard from './CrmKanbanBoard';
import CrmAccountDetail from './CrmAccountDetail';
import CrmAccountModal from './CrmAccountModal';
import {
  Search, Plus, Filter, LayoutGrid, List,
  AlertTriangle, Calendar, Building2,
  Users, RefreshCw, Trash2, Pencil,
  Phone, DollarSign, ArrowLeft
} from 'lucide-react';

interface CrmDashboardProps {
  onBack: () => void;
}

export default function CrmDashboard({ onBack }: CrmDashboardProps) {
  const {
    loading, searchQuery, filterStage, filterAssignee,
    setSearchQuery, setFilterStage, setFilterAssignee,
    loadAccounts, getStats, getFilteredAccounts,
    selectedAccountId, setSelectedAccountId,
    deleteAccount,
  } = useCrmStore();
  const { loadTeamMembers, teamMembers } = useMessageStore();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CrmAccount | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAccounts();
    loadTeamMembers();
  }, [loadAccounts, loadTeamMembers]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      loadAccounts();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadAccounts]);

  const stats = getStats();
  const filteredAccounts = getFilteredAccounts();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAccounts();
    setIsRefreshing(false);
  };

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
  };

  const handleEditAccount = (account: CrmAccount) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleNewAccount = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm('Supprimer ce compte? Cette action est irreversible.')) {
      await deleteAccount(id);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' });
  };

  // Unique assignees for filter
  const uniqueAssignees = Array.from(new Set(
    useCrmStore.getState().accounts.map((a) => a.assigned_to).filter(Boolean)
  ));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[95%] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <img
                src="/wx-logo-stacked-brandred-black.png"
                alt="WholesaleXpress"
                className="h-10"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Reouverture de comptes</h1>
                <p className="text-xs text-gray-500">Pipeline CRM - WholesaleXpress</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                title="Actualiser"
              >
                <RefreshCw className="h-4 w-4 text-gray-500" />
              </button>
              <button
                onClick={handleNewAccount}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 transition-colors font-medium shadow-lg hover:shadow-xl text-sm"
              >
                <Plus className="h-4 w-4" />
                Nouveau compte
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[95%] mx-auto px-4 py-3">
          <div className="flex gap-3 overflow-x-auto">
            <StatCard
              icon={Building2}
              label="Total comptes"
              value={stats.total}
              color="text-gray-700"
              bgColor="bg-gray-100"
            />
            {STAGE_ORDER.filter(s => s !== 'perdu').map((stage) => {
              const conf = STAGE_CONFIG[stage];
              return (
                <StatCard
                  key={stage}
                  icon={Building2}
                  label={conf.label}
                  value={stats.byStage[stage]}
                  color={conf.color}
                  bgColor={conf.bgColor}
                  onClick={() => setFilterStage(filterStage === stage ? 'all' : stage)}
                  active={filterStage === stage}
                />
              );
            })}
            <StatCard
              icon={AlertTriangle}
              label="Priorite haute"
              value={stats.highPriority}
              color="text-red-700"
              bgColor="bg-red-50"
            />
            <StatCard
              icon={Calendar}
              label="Suivis aujourd'hui"
              value={stats.followupsToday}
              color="text-amber-700"
              bgColor="bg-amber-50"
            />
            {stats.followupsOverdue > 0 && (
              <StatCard
                icon={AlertTriangle}
                label="En retard"
                value={stats.followupsOverdue}
                color="text-red-700"
                bgColor="bg-red-100"
                pulse
              />
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[95%] mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un compte, contact, courriel..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter by stage */}
            <div className="relative">
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value as AccountStage | 'all')}
                className="appearance-none text-xs border border-gray-300 rounded-lg pl-3 pr-8 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Toutes les etapes</option>
                {STAGE_ORDER.map((s) => (
                  <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter by assignee */}
            <div className="relative">
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="appearance-none text-xs border border-gray-300 rounded-lg pl-3 pr-8 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les membres</option>
                {uniqueAssignees.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <Users className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* View mode toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden ml-auto">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 text-xs flex items-center gap-1.5 transition-colors ${
                  viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Pipeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-xs flex items-center gap-1.5 transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Liste
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[95%] mx-auto px-4 py-4 w-full">
        {loading && !isRefreshing ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : viewMode === 'kanban' ? (
          <CrmKanbanBoard
            onSelectAccount={handleSelectAccount}
            onEditAccount={handleEditAccount}
          />
        ) : (
          /* List View */
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Etape</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Priorite</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Assigne</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Prochain suivi</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Potentiel</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      Aucun compte trouve
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => {
                    const stageConf = STAGE_CONFIG[account.stage];
                    const priorityConf = PRIORITY_CONFIG[account.priority];
                    const isOverdue = account.next_followup_date && new Date(account.next_followup_date) < new Date();

                    return (
                      <tr
                        key={account.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleSelectAccount(account.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{account.company_name}</div>
                          {account.previous_account_number && (
                            <span className="text-[10px] text-gray-400">#{account.previous_account_number}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-700">{account.contact_name || '-'}</div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            {account.contact_phone && (
                              <span className="flex items-center gap-0.5">
                                <Phone className="h-2.5 w-2.5" />
                                {account.contact_phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stageConf.bgColor} ${stageConf.color} border ${stageConf.borderColor}`}>
                            {stageConf.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityConf.bgColor} ${priorityConf.color}`}>
                            {priorityConf.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {account.assigned_to ? (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                              {account.assigned_to}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            {formatDate(account.next_followup_date)}
                            {isOverdue && ' !'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {account.revenue_potential > 0 ? (
                            <span className="text-xs font-medium text-emerald-600">
                              ${account.revenue_potential.toLocaleString('fr-CA')}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEditAccount(account)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Modifier"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(account.id)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* List footer with total revenue */}
            {filteredAccounts.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {filteredAccounts.length} compte{filteredAccounts.length > 1 ? 's' : ''}
                </span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  Potentiel total: ${filteredAccounts.reduce((sum, a) => sum + a.revenue_potential, 0).toLocaleString('fr-CA')}
                </span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Account Detail Side Panel */}
      {selectedAccountId && (
        <CrmAccountDetail
          accountId={selectedAccountId}
          onClose={() => setSelectedAccountId(null)}
        />
      )}

      {/* Account Create/Edit Modal */}
      <CrmAccountModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editAccount={editingAccount}
      />
    </div>
  );
}

interface StatCardProps {
  icon: any;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  onClick?: () => void;
  active?: boolean;
  pulse?: boolean;
}

function StatCard({ icon: Icon, label, value, color, bgColor, onClick, active, pulse }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all whitespace-nowrap ${
        active
          ? `${bgColor} border-current ${color} shadow-md`
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      } ${pulse ? 'animate-pulse-subtle' : ''} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`p-1.5 rounded-lg ${bgColor}`}>
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </div>
      <div className="text-left">
        <div className="text-[10px] text-gray-500 font-medium">{label}</div>
        <div className={`text-lg font-bold ${color}`}>{value}</div>
      </div>
    </button>
  );
}

