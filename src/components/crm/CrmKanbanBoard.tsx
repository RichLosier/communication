import React, { useState } from 'react';
import { useCrmStore } from '../../store/crmStore';
import { AccountStage, STAGE_ORDER, STAGE_CONFIG, PRIORITY_CONFIG, CrmAccount } from '../../types/crm';
import { GripVertical, Phone, Mail, Calendar, Tag, AlertTriangle, ArrowRight, ChevronRight, Building2 } from 'lucide-react';

interface CrmKanbanBoardProps {
  onSelectAccount: (id: string) => void;
  onEditAccount: (account: CrmAccount) => void;
}

export default function CrmKanbanBoard({ onSelectAccount, onEditAccount }: CrmKanbanBoardProps) {
  const { getAccountsByStage, moveAccountToStage } = useCrmStore();
  const [draggedAccount, setDraggedAccount] = useState<CrmAccount | null>(null);
  const [dragOverStage, setDragOverStage] = useState<AccountStage | null>(null);

  const handleDragStart = (e: React.DragEvent, account: CrmAccount) => {
    setDraggedAccount(account);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', account.id);
  };

  const handleDragOver = (e: React.DragEvent, stage: AccountStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: AccountStage) => {
    e.preventDefault();
    setDragOverStage(null);
    if (draggedAccount && draggedAccount.stage !== targetStage) {
      await moveAccountToStage(draggedAccount.id, targetStage, draggedAccount.assigned_to || 'Systeme');
    }
    setDraggedAccount(null);
  };

  const handleQuickMove = async (account: CrmAccount, targetStage: AccountStage) => {
    await moveAccountToStage(account.id, targetStage, account.assigned_to || 'Systeme');
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (date: string | null) => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isToday = (date: string | null) => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  // Get next logical stages for quick-move buttons
  const getNextStages = (currentStage: AccountStage): AccountStage[] => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    const options: AccountStage[] = [];
    // Show the next stage in the pipeline and "actif" as a shortcut
    if (currentIndex < STAGE_ORDER.length - 2) {
      options.push(STAGE_ORDER[currentIndex + 1]);
    }
    if (currentStage !== 'actif' && currentStage !== 'perdu') {
      if (!options.includes('actif')) options.push('actif');
    }
    if (currentStage !== 'perdu') {
      options.push('perdu');
    }
    return options;
  };

  // Filter out 'perdu' from main pipeline view, show it separately
  const mainStages = STAGE_ORDER.filter((s) => s !== 'perdu');
  const perduAccounts = getAccountsByStage('perdu');

  return (
    <div className="space-y-4">
      {/* Main pipeline columns */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '500px' }}>
        {mainStages.map((stage) => {
          const config = STAGE_CONFIG[stage];
          const accounts = getAccountsByStage(stage);
          const isDragOver = dragOverStage === stage;

          return (
            <div
              key={stage}
              className={`flex-1 min-w-[260px] rounded-xl border-2 transition-all duration-200 ${
                isDragOver
                  ? `${config.borderColor} ${config.bgColor} shadow-lg scale-[1.01]`
                  : 'border-gray-200 bg-gray-50/50'
              }`}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column header */}
              <div className={`px-4 py-3 border-b-2 ${config.borderColor} ${config.bgColor} rounded-t-xl`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm ${config.color}`}>{config.label}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                    {accounts.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
                {accounts.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    Glissez un compte ici
                  </div>
                )}
                {accounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onDragStart={handleDragStart}
                    onClick={() => onSelectAccount(account.id)}
                    onEdit={() => onEditAccount(account)}
                    onQuickMove={handleQuickMove}
                    getNextStages={getNextStages}
                    formatDate={formatDate}
                    isOverdue={isOverdue}
                    isToday={isToday}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Perdu section (collapsed/smaller) */}
      {perduAccounts.length > 0 && (
        <div
          className="rounded-xl border-2 border-red-200 bg-red-50/30"
          onDragOver={(e) => handleDragOver(e, 'perdu')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'perdu')}
        >
          <div className="px-4 py-2 border-b border-red-200 bg-red-50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-red-700">Perdu / Ferme</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                {perduAccounts.length}
              </span>
            </div>
          </div>
          <div className="p-2 flex flex-wrap gap-2">
            {perduAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-white rounded-lg border border-red-200 px-3 py-2 text-sm cursor-pointer hover:shadow-md transition-shadow flex items-center gap-2"
                onClick={() => onSelectAccount(account.id)}
              >
                <Building2 className="h-3.5 w-3.5 text-red-400" />
                <span className="font-medium text-gray-700">{account.company_name}</span>
                {account.reason_closed && (
                  <span className="text-xs text-red-500">- {account.reason_closed}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AccountCardProps {
  account: CrmAccount;
  onDragStart: (e: React.DragEvent, account: CrmAccount) => void;
  onClick: () => void;
  onEdit: () => void;
  onQuickMove: (account: CrmAccount, stage: AccountStage) => void;
  getNextStages: (stage: AccountStage) => AccountStage[];
  formatDate: (date: string | null) => string | null;
  isOverdue: (date: string | null) => boolean;
  isToday: (date: string | null) => boolean;
}

function AccountCard({
  account,
  onDragStart,
  onClick,
  onQuickMove,
  getNextStages,
  formatDate,
  isOverdue,
  isToday,
}: AccountCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const priorityConf = PRIORITY_CONFIG[account.priority];
  const nextStages = getNextStages(account.stage);
  const followupDate = formatDate(account.next_followup_date);
  const overdue = isOverdue(account.next_followup_date);
  const todayFollowup = isToday(account.next_followup_date);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, account)}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing group"
    >
      <div className="p-3">
        {/* Header row */}
        <div className="flex items-start gap-2 mb-2">
          <GripVertical className="h-4 w-4 text-gray-300 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          <div className="flex-1 min-w-0" onClick={onClick}>
            <div className="font-semibold text-sm text-gray-900 truncate">{account.company_name}</div>
            {account.contact_name && (
              <div className="text-xs text-gray-500 truncate">{account.contact_name}</div>
            )}
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${priorityConf.bgColor} ${priorityConf.color} flex-shrink-0`}>
            {priorityConf.label}
          </span>
        </div>

        {/* Info row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2 text-xs text-gray-500" onClick={onClick}>
          {account.contact_phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {account.contact_phone}
            </span>
          )}
          {account.contact_email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{account.contact_email}</span>
            </span>
          )}
          {account.revenue_potential > 0 && (
            <span className="font-medium text-emerald-600">
              ${account.revenue_potential.toLocaleString('fr-CA')}
            </span>
          )}
        </div>

        {/* Follow-up date */}
        {followupDate && (
          <div
            className={`flex items-center gap-1 text-xs mb-2 px-2 py-1 rounded-md ${
              overdue
                ? 'bg-red-50 text-red-700 font-semibold'
                : todayFollowup
                ? 'bg-amber-50 text-amber-700 font-semibold'
                : 'bg-gray-50 text-gray-600'
            }`}
          >
            {overdue && <AlertTriangle className="h-3 w-3" />}
            <Calendar className="h-3 w-3" />
            <span>Suivi: {followupDate}</span>
            {overdue && <span className="ml-1">(en retard)</span>}
            {todayFollowup && <span className="ml-1">(aujourd'hui)</span>}
          </div>
        )}

        {/* Tags */}
        {account.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {account.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="flex items-center gap-0.5 text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
            {account.tags.length > 3 && (
              <span className="text-[10px] text-gray-400">+{account.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Assigned + Quick move */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {account.assigned_to ? (
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {account.assigned_to}
            </span>
          ) : (
            <span className="text-[10px] text-gray-300">Non assigne</span>
          )}

          {/* Quick move */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoveMenu(!showMoveMenu);
              }}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100 transition-colors"
              title="Deplacer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {showMoveMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMoveMenu(false)} />
                <div className="absolute right-0 bottom-full mb-1 z-20 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px]">
                  <div className="px-3 py-1 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    Deplacer vers
                  </div>
                  {nextStages.map((stage) => {
                    const conf = STAGE_CONFIG[stage];
                    return (
                      <button
                        key={stage}
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickMove(account, stage);
                          setShowMoveMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <ArrowRight className={`h-3 w-3 ${conf.color}`} />
                        <span className={conf.color}>{conf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
