import React, { useEffect, useState } from 'react';
import { useCrmStore } from '../../store/crmStore';
import { useMessageStore } from '../../store/messageStore';
import { STAGE_CONFIG, PRIORITY_CONFIG, NOTE_TYPE_CONFIG, CrmNote, AccountStage, STAGE_ORDER } from '../../types/crm';
import {
  X, Building2, User, Phone, Mail, Calendar, Tag, DollarSign,
  Hash, StickyNote, Clock, ArrowRight, Plus, Trash2,
  ChevronDown, Send, Activity
} from 'lucide-react';

interface CrmAccountDetailProps {
  accountId: string;
  onClose: () => void;
}

export default function CrmAccountDetail({ accountId, onClose }: CrmAccountDetailProps) {
  const {
    getAccountById, notes, activities,
    loadNotes, loadActivities, addNote, deleteNote,
    moveAccountToStage, updateAccount,
  } = useCrmStore();
  const { teamMembers } = useMessageStore();

  const account = getAccountById(accountId);
  const accountNotes = notes[accountId] || [];
  const accountActivities = activities[accountId] || [];

  const [activeTab, setActiveTab] = useState<'notes' | 'activites' | 'details'>('notes');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<CrmNote['note_type']>('note');
  const [newNoteAuthor, setNewNoteAuthor] = useState('');
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadNotes(accountId);
    loadActivities(accountId);
  }, [accountId, loadNotes, loadActivities]);

  if (!account) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-gray-500">Compte introuvable</p>
          <button onClick={onClose} className="mt-4 text-blue-600 hover:underline">Fermer</button>
        </div>
      </div>
    );
  }

  const stageConf = STAGE_CONFIG[account.stage];
  const priorityConf = PRIORITY_CONFIG[account.priority];

  const handleAddNote = async () => {
    if (!newNoteContent.trim() || !newNoteAuthor.trim()) return;
    setIsSubmitting(true);
    try {
      await addNote(accountId, {
        author: newNoteAuthor,
        content: newNoteContent,
        note_type: newNoteType,
      });
      setNewNoteContent('');
    } catch {
      // Error handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStageChange = async (newStage: AccountStage) => {
    setShowStageDropdown(false);
    if (newStage !== account.stage) {
      await moveAccountToStage(accountId, newStage, account.assigned_to || 'Systeme');
      await loadActivities(accountId);
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div
        className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-slide-in"
        style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <Building2 className="h-5 w-5 text-gray-400" />
                <h2 className="text-xl font-bold text-gray-900 truncate">{account.company_name}</h2>
              </div>
              {account.contact_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600 ml-8">
                  <User className="h-3.5 w-3.5" />
                  {account.contact_name}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stage & Priority badges */}
          <div className="flex items-center gap-3 mt-3 ml-8">
            {/* Stage dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStageDropdown(!showStageDropdown)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border-2 ${stageConf.bgColor} ${stageConf.color} ${stageConf.borderColor} hover:opacity-80 transition-opacity`}
              >
                {stageConf.label}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showStageDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStageDropdown(false)} />
                  <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]">
                    {STAGE_ORDER.map((stage) => {
                      const conf = STAGE_CONFIG[stage];
                      return (
                        <button
                          key={stage}
                          onClick={() => handleStageChange(stage)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                            stage === account.stage ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${conf.bgColor} border ${conf.borderColor}`} />
                          <span className={conf.color}>{conf.label}</span>
                          {stage === account.stage && (
                            <span className="ml-auto text-gray-400 text-[10px]">actuel</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityConf.bgColor} ${priorityConf.color}`}>
              {priorityConf.label}
            </span>

            {account.assigned_to && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                {account.assigned_to}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {([
            { id: 'notes', label: 'Notes', icon: StickyNote, count: accountNotes.length },
            { id: 'activites', label: 'Historique', icon: Activity, count: accountActivities.length },
            { id: 'details', label: 'Details', icon: Hash, count: null },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="p-4 space-y-4">
              {/* New note form */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Plus className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Ajouter une note</span>
                </div>

                <div className="flex gap-2 mb-3">
                  {/* Author select */}
                  <select
                    value={newNoteAuthor}
                    onChange={(e) => setNewNoteAuthor(e.target.value)}
                    className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Auteur...</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>

                  {/* Note type select */}
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    {(Object.keys(NOTE_TYPE_CONFIG) as CrmNote['note_type'][]).map((type) => {
                      const conf = NOTE_TYPE_CONFIG[type];
                      return (
                        <button
                          key={type}
                          onClick={() => setNewNoteType(type)}
                          className={`px-2 py-1.5 text-[10px] font-medium transition-colors ${
                            newNoteType === type
                              ? `${conf.color} bg-gray-100 font-bold`
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {conf.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Ecrire une note..."
                    className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddNote();
                      }
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-gray-400">Ctrl+Enter pour envoyer</span>
                  <button
                    onClick={handleAddNote}
                    disabled={!newNoteContent.trim() || !newNoteAuthor || isSubmitting}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <Send className="h-3 w-3" />
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Notes list */}
              {accountNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Aucune note pour ce compte
                </div>
              ) : (
                <div className="space-y-3">
                  {accountNotes.map((note) => {
                    const typeConf = NOTE_TYPE_CONFIG[note.note_type] || NOTE_TYPE_CONFIG.note;
                    return (
                      <div key={note.id} className="bg-white rounded-lg border border-gray-200 p-3 group">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${typeConf.color} bg-gray-50`}>
                              {typeConf.label}
                            </span>
                            <span className="text-xs font-semibold text-gray-700">{note.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">
                              {formatDateTime(note.created_at)}
                            </span>
                            <button
                              onClick={() => deleteNote(note.id, accountId)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-0.5"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activites' && (
            <div className="p-4">
              {accountActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Aucune activite enregistree
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
                  <div className="space-y-4">
                    {accountActivities.map((activity) => (
                      <div key={activity.id} className="relative flex gap-4 pl-8">
                        <div className="absolute left-[11px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-blue-400" />
                        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-semibold text-gray-700">{activity.actor}</span>
                            <span className="text-[10px] text-gray-400">
                              {formatDateTime(activity.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            {activity.details || activity.action}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={Building2} label="Entreprise" value={account.company_name} />
                <DetailItem icon={User} label="Contact" value={account.contact_name || '-'} />
                <DetailItem icon={Phone} label="Telephone" value={account.contact_phone || '-'} />
                <DetailItem icon={Mail} label="Courriel" value={account.contact_email || '-'} />
                <DetailItem icon={Hash} label="No. compte precedent" value={account.previous_account_number || '-'} />
                <DetailItem icon={DollarSign} label="Potentiel" value={account.revenue_potential > 0 ? `$${account.revenue_potential.toLocaleString('fr-CA')}` : '-'} />
                <DetailItem icon={Calendar} label="Dernier contact" value={formatDate(account.last_contact_date)} />
                <DetailItem icon={Calendar} label="Prochain suivi" value={formatDate(account.next_followup_date)} />
                <DetailItem icon={Clock} label="Cree le" value={formatDateTime(account.created_at)} />
                <DetailItem icon={Clock} label="Mis a jour" value={formatDateTime(account.updated_at)} />
              </div>

              {account.reason_closed && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <span className="text-xs font-medium text-red-700 block mb-1">Raison de fermeture</span>
                  <p className="text-sm text-red-600">{account.reason_closed}</p>
                </div>
              )}

              {account.tags.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500 block mb-2">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {account.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3 w-3 text-gray-400" />
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}
