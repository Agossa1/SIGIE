import { useRef, useState } from "react";
import { Camera, X, ZoomIn } from "lucide-react";

interface PhotoCaptureFieldProps {
  value: string | null;
  onChange: (base64: string | null) => void;
}

const PhotoCaptureField = ({ value, onChange }: PhotoCaptureFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-800 mb-2 block">
        Preuve photographique
        <span className="ml-1 text-gray-400 font-normal">(optionnel)</span>
      </span>

      {preview ? (
        <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 group">
          <img
            src={preview}
            alt="Aperçu"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="p-2 bg-white rounded-full text-gray-700 shadow hover:bg-gray-50"
              title="Agrandir"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-white rounded-full text-rose-600 shadow hover:bg-rose-50"
              title="Supprimer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-28 border border-dashed border-gray-300 bg-gray-50/50 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all"
        >
          <Camera className="w-6 h-6" />
          <span className="text-sm font-medium">Ajouter une photo</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Lightbox zoom */}
      {isZoomed && preview && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={preview}
            alt="Photo plein écran"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoCaptureField;
