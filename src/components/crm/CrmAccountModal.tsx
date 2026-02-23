import React, { useState, useEffect } from 'react';
import { useCrmStore } from '../../store/crmStore';
import { useMessageStore } from '../../store/messageStore';
import { CrmAccount, AccountStage, AccountPriority, STAGE_CONFIG, STAGE_ORDER, PRIORITY_CONFIG } from '../../types/crm';
import { X, Building2, User, Phone, Mail, Hash, DollarSign, Calendar, Tag, Plus } from 'lucide-react';

interface CrmAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAccount?: CrmAccount | null;
}

export default function CrmAccountModal({ isOpen, onClose, editAccount }: CrmAccountModalProps) {
  const { addAccount, updateAccount } = useCrmStore();
  const { teamMembers } = useMessageStore();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [stage, setStage] = useState<AccountStage>('prospect');
  const [priority, setPriority] = useState<AccountPriority>('moyenne');
  const [assignedTo, setAssignedTo] = useState('');
  const [previousAccountNumber, setPreviousAccountNumber] = useState('');
  const [revenuePotential, setRevenuePotential] = useState('');
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [reasonClosed, setReasonClosed] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editAccount;

  useEffect(() => {
    if (editAccount) {
      setCompanyName(editAccount.company_name);
      setContactName(editAccount.contact_name);
      setContactEmail(editAccount.contact_email);
      setContactPhone(editAccount.contact_phone);
      setStage(editAccount.stage);
      setPriority(editAccount.priority);
      setAssignedTo(editAccount.assigned_to);
      setPreviousAccountNumber(editAccount.previous_account_number);
      setRevenuePotential(editAccount.revenue_potential > 0 ? editAccount.revenue_potential.toString() : '');
      setNextFollowupDate(editAccount.next_followup_date ? editAccount.next_followup_date.split('T')[0] : '');
      setReasonClosed(editAccount.reason_closed);
      setTags(editAccount.tags);
    } else {
      resetForm();
    }
  }, [editAccount, isOpen]);

  const resetForm = () => {
    setCompanyName('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setStage('prospect');
    setPriority('moyenne');
    setAssignedTo('');
    setPreviousAccountNumber('');
    setRevenuePotential('');
    setNextFollowupDate('');
    setReasonClosed('');
    setTagInput('');
    setTags([]);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    try {
      const data = {
        company_name: companyName.trim(),
        contact_name: contactName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        stage,
        priority,
        assigned_to: assignedTo,
        previous_account_number: previousAccountNumber.trim(),
        revenue_potential: parseFloat(revenuePotential) || 0,
        last_contact_date: null,
        next_followup_date: nextFollowupDate ? new Date(nextFollowupDate).toISOString() : null,
        reason_closed: reasonClosed.trim(),
        tags,
      };

      if (isEditing && editAccount) {
        await updateAccount(editAccount.id, data);
      } else {
        await addAccount(data);
      }
      onClose();
      resetForm();
    } catch {
      // Error handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            {isEditing ? 'Modifier le compte' : 'Nouveau compte'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Company name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
              <Building2 className="h-3.5 w-3.5" />
              Nom de l'entreprise *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Plomberie ABC Inc."
              required
            />
          </div>

          {/* Contact info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
                <User className="h-3.5 w-3.5" />
                Nom du contact
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jean Tremblay"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
                <Phone className="h-3.5 w-3.5" />
                Telephone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="514-555-1234"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
              <Mail className="h-3.5 w-3.5" />
              Courriel
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="jean@plomberie-abc.com"
            />
          </div>

          {/* Stage & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Etape du pipeline</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as AccountStage)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {STAGE_ORDER.map((s) => (
                  <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Priorite</label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                {(Object.keys(PRIORITY_CONFIG) as AccountPriority[]).map((p) => {
                  const conf = PRIORITY_CONFIG[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                        priority === p
                          ? `${conf.bgColor} ${conf.color} font-bold`
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {conf.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Assigned to */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Assigne a</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Non assigne</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Account number & Revenue */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
                <Hash className="h-3.5 w-3.5" />
                No. compte precedent
              </label>
              <input
                type="text"
                value={previousAccountNumber}
                onChange={(e) => setPreviousAccountNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="WX-12345"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
                <DollarSign className="h-3.5 w-3.5" />
                Potentiel de revenu ($)
              </label>
              <input
                type="number"
                value={revenuePotential}
                onChange={(e) => setRevenuePotential(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="5000"
                min="0"
                step="100"
              />
            </div>
          </div>

          {/* Follow-up date */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
              <Calendar className="h-3.5 w-3.5" />
              Prochain suivi
            </label>
            <input
              type="date"
              value={nextFollowupDate}
              onChange={(e) => setNextFollowupDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Reason closed (show only for perdu stage) */}
          {stage === 'perdu' && (
            <div>
              <label className="text-xs font-medium text-red-700 mb-1 block">Raison de fermeture</label>
              <textarea
                value={reasonClosed}
                onChange={(e) => setReasonClosed(e.target.value)}
                className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={2}
                placeholder="Pourquoi ce compte est perdu..."
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
              <Tag className="h-3.5 w-3.5" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ajouter un tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!companyName.trim() || isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            {isEditing ? 'Enregistrer' : 'Creer le compte'}
          </button>
        </div>
      </div>
    </div>
  );
}
