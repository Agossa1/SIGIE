import { useState, useRef } from "react";
import { useUploadLayerMutation, useDeleteLayerMutation, useGetLayersQuery } from "../services/gis.rtk";

const LAYER_TYPE_LABELS: Record<string, string> = {
    region: "Région (Découpage)",
    municipality: "Commune (Découpage)",
    district: "Arrondissement (Découpage)",
    neighborhood: "Quartier (Découpage)",
    water_network: "Réseau d'eau",
    drainage: "Réseau de drainage",
    roads: "Voirie",
    flood_zones: "Zones inondables",
    electricity: "Réseau électrique",
    buildings: "Bâtiments / Ouvrages",
    vegetation: "Couvert végétal",
    other: "Autre",
};

const LAYER_TYPE_COLORS: Record<string, string> = {
    region: "#4f46e5",
    municipality: "#0ea5e9",
    district: "#8b5cf6",
    neighborhood: "#ec4899",
    water_network: "#3b82f6",
    drainage: "#06b6d4",
    roads: "#6b7280",
    flood_zones: "#ef4444",
    electricity: "#f59e0b",
    buildings: "#8b5cf6",
    vegetation: "#22c55e",
    other: "#94a3b8",
};

export const AdminMapLayers = () => {
    // RTK Query — source unique pour les données SIG
    const { data: layers = [], isLoading: loading, error: queryError, refetch: refetchLayers } = useGetLayersQuery();
    const error = queryError ? "Erreur de chargement des couches" : null;

    const [form, setForm] = useState({
        name: "",
        layerType: "other",
        description: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [geojsonContent, setGeojsonContent] = useState<any>(null);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    
    // Hooks RTK Query
    const [uploadLayer] = useUploadLayerMutation();
    const [deleteLayerRtk] = useDeleteLayerMutation();

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const fileRef = useRef<HTMLInputElement>(null);

    // RTK Query gère automatiquement le fetch initial et le cache — pas besoin de useEffect

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setParseError(null);
        setFileName(null);
        setSelectedFile(null);
        setGeojsonContent(null);
        setIsProcessingFile(false);
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setSelectedFile(file);

        // Parse GeoJSON file for local preview
        if (file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.geojson')) {
            setIsProcessingFile(true);
            try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                setGeojsonContent(parsed);
            } catch (err) {
                setParseError("Erreur de lecture du fichier GeoJSON. Vérifiez le format.");
                setSelectedFile(null);
                setFileName(null);
            } finally {
                setIsProcessingFile(false);
            }
        } else if (file.name.toLowerCase().endsWith('.zip')) {
            // For ZIP files (Shapefile), we can't parse client-side, so just allow upload
            setGeojsonContent({ features: [] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;
        
        setSuccessMsg(null);
        setUploadError(null);
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('name', form.name);
            formData.append('layerType', form.layerType);
            if (form.description) {
                formData.append('description', form.description);
            }

            const result = await uploadLayer(formData).unwrap();

            setSuccessMsg(`✓ Couche importée avec ${result.featureCount} feature(s).`);
            setForm({ name: "", layerType: "other", description: "" });
            setSelectedFile(null);
            setFileName(null);
            setGeojsonContent(null);
            if (fileRef.current) fileRef.current.value = "";
            refetchLayers();
        } catch (error: any) {
            console.error("Erreur d'upload:", error);
            setUploadError(error.data?.message || error.message || "Erreur lors de l'import de la couche sur le serveur.");
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Supprimer la couche "${name}" ? Cette action est irréversible.`)) return;
        try {
            await deleteLayerRtk(id).unwrap();
        } catch (error: any) {
            console.error("Erreur de suppression:", error);
            alert("Erreur lors de la suppression de la couche.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Formulaire d'upload */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-sm font-medium text-gray-900">Importer une couche SIG (GeoJSON)</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Superposez vos données d'infrastructure réelles sur la carte.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom de la couche <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-colors"
                                placeholder="Ex: Réseau eau potable 2024"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type de couche <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-colors bg-white"
                                value={form.layerType}
                                onChange={(e) => setForm({ ...form, layerType: e.target.value })}
                            >
                                {Object.entries(LAYER_TYPE_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnelle)</label>
                        <input
                            type="text"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-colors"
                            placeholder="Ex: Données issues du service technique municipal"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fichier GeoJSON <span className="text-red-500">*</span>
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-xl px-4 py-6 text-center transition-colors cursor-pointer
                                ${geojsonContent ? "border-emerald-300 bg-emerald-50" : "border-gray-200 hover:border-indigo-300 bg-gray-50"}`}
                            onClick={() => fileRef.current?.click()}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".geojson,.json,.zip"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {isProcessingFile ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                                    <span className="text-sm font-medium text-indigo-600">Lecture du fichier en cours...</span>
                                    <span className="text-sm text-gray-400">Cela peut prendre quelques instants pour les gros fichiers</span>
                                </div>
                            ) : geojsonContent ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-2xl">✓</span>
                                    <span className="text-sm font-medium text-emerald-700">{fileName}</span>
                                    <span className="text-sm text-emerald-500">{geojsonContent.features?.length ?? 0} feature(s) détecté(s)</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1">
                                    <svg className="w-8 h-8 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-500">Cliquer pour sélectionner un fichier (.geojson ou .zip Shapefile)</span>
                                    <span className="text-sm text-gray-400">Pour un Shapefile, uploadez le fichier .zip complet</span>
                                </div>
                            )}
                        </div>
                        {parseError && <p className="text-sm text-red-500 mt-1">{parseError}</p>}
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
                    {successMsg && <p className="text-sm text-emerald-600 font-medium">{successMsg}</p>}

                    {isUploading && uploadProgress !== null && (
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                            <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!geojsonContent || !form.name || isUploading || isProcessingFile}
                            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                    Import en cours... {uploadProgress !== null ? `${uploadProgress}%` : ''}
                                </>
                            ) : (
                                "Importer la couche"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Liste des couches existantes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Couches SIG disponibles</h3>
                    <span className="text-sm text-gray-400">{layers.length} couche(s)</span>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Chargement...</p>
                    </div>
                ) : layers.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-sm text-gray-400">Aucune couche importée pour le moment.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {layers.map((layer) => {
                            const color = LAYER_TYPE_COLORS[layer.layerType] ?? "#94a3b8";
                            const typeLabel = LAYER_TYPE_LABELS[layer.layerType] ?? layer.layerType;
                            return (
                                <div key={layer.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-2"
                                        style={{ backgroundColor: color, '--tw-ring-color': color } as React.CSSProperties}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900 truncate">{layer.name}</span>
                                            <span
                                                className="px-2 py-0.5 rounded-full text-sm font-medium flex-shrink-0"
                                                style={{ backgroundColor: `${color}18`, color }}
                                            >
                                                {typeLabel}
                                            </span>
                                        </div>
                                        {layer.description && (
                                            <p className="text-sm text-gray-400 mt-0.5 truncate">{layer.description}</p>
                                        )}
                                        <p className="text-sm text-gray-300 mt-0.5">
                                            {layer.featureCount ?? 0} feature(s) · {new Date(layer.createdAt).toLocaleDateString("fr-FR")}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(layer.id, layer.name)}
                                        className="text-sm text-rose-500 hover:text-rose-700 font-medium flex-shrink-0 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
