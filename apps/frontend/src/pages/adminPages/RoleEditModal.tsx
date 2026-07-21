import { useState } from "react";
import type { RoleRecord } from "../../feature/roles/services/roles.api";
import { ROLE_PAGE_DEFINITIONS, type RolePageId } from "../shared/rolePages.config";
import { getPageLabel } from "../shared/roleCatalog";

interface RoleEditModalProps {
    role: RoleRecord | null;
    isOpen?: boolean;
    onClose: () => void;
    onSave: (id: string, data: Partial<RoleRecord>) => Promise<void>;
}

const RoleEditModal = ({ role, isOpen, onClose, onSave }: RoleEditModalProps) => {
    const [name, setName] = useState(role?.name || "");
    const [description, setDescription] = useState(role?.description || "");
    const [pageIds, setPageIds] = useState<RolePageId[]>(role?.page_ids || []);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !role) return null;

    const allPages = Object.keys(ROLE_PAGE_DEFINITIONS) as RolePageId[];

    const togglePage = (pageId: RolePageId) => {
        setPageIds(prev => 
            prev.includes(pageId) ? prev.filter(p => p !== pageId) : [...prev, pageId]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(role.id, { name, description, page_ids: pageIds });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900">Modifier le rôle</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Nom du rôle</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Description</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 block">Pages accessibles</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {allPages.map(pageId => (
                                <label key={pageId} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                    <div className="flex items-center h-5">
                                        <input 
                                            type="checkbox" 
                                            checked={pageIds.includes(pageId)}
                                            onChange={() => togglePage(pageId)}
                                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900">{getPageLabel(pageId)}</span>
                                        <span className="text-sm text-gray-500">{ROLE_PAGE_DEFINITIONS[pageId].routeSuffix}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-medium text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleEditModal;
