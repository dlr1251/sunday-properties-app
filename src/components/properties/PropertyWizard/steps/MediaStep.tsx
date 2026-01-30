import React, { useRef } from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { PropertyFormData } from '../PropertyWizard';
import { Upload, X, Camera, Video } from 'lucide-react';

interface MediaStepProps {
  data: PropertyFormData;
  onUpdate: (updates: Partial<PropertyFormData>) => void;
  isDarkMode?: boolean;
}

export const MediaStep: React.FC<MediaStepProps> = ({
  data,
  onUpdate,
  isDarkMode = true
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const cardClasses = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onUpdate({ images: [...data.images, ...files] });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onUpdate({ videos: [...data.videos, ...files] });
  };

  const removeImage = (index: number) => {
    onUpdate({ images: data.images.filter((_, i) => i !== index) });
  };

  const removeVideo = (index: number) => {
    onUpdate({ videos: data.videos.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      {/* Images */}
      <div>
        <Label className={textPrimary}>Fotos de la Propiedad *</Label>
        <p className={`text-sm mt-1 ${textSecondary}`}>Suba al menos 5 fotos de alta calidad</p>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.images.map((file, index) => (
            <div key={index} className={`relative group ${cardClasses} p-2 rounded-lg`}>
              <img
                src={URL.createObjectURL(file)}
                alt={`Propiedad ${index + 1}`}
                className="w-full h-24 object-cover rounded"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <div
            onClick={() => imageInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors ${cardClasses}`}
          >
            <Upload className={`w-8 h-8 mb-2 ${textSecondary}`} />
            <span className={`text-sm ${textPrimary}`}>Agregar Foto</span>
          </div>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Videos */}
      <div>
        <Label className={textPrimary}>Videos (Opcional)</Label>
        <p className={`text-sm mt-1 ${textSecondary}`}>Suba videos de la propiedad</p>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.videos.map((file, index) => (
            <div key={index} className={`relative group ${cardClasses} p-2 rounded-lg`}>
              <div className="w-full h-24 bg-gray-700 rounded flex items-center justify-center">
                <Video className={`w-8 h-8 ${textSecondary}`} />
              </div>
              <div className={`mt-2 text-xs ${textSecondary} truncate`}>{file.name}</div>
              <button
                onClick={() => removeVideo(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <div
            onClick={() => videoInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors ${cardClasses}`}
          >
            <Video className={`w-8 h-8 mb-2 ${textSecondary}`} />
            <span className={`text-sm ${textPrimary}`}>Agregar Video</span>
          </div>
        </div>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleVideoUpload}
          className="hidden"
        />
      </div>

      {/* Virtual Tour */}
      <div>
        <Label htmlFor="virtual_tour" className={textPrimary}>Tour Virtual (Opcional)</Label>
        <Input
          id="virtual_tour"
          value={data.virtual_tour || ''}
          onChange={(e) => onUpdate({ virtual_tour: e.target.value })}
          placeholder="URL del tour virtual (Matterport, etc.)"
          className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
        />
      </div>
    </div>
  );
};
