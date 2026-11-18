import { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';

export const StorageInitializer: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await storageService.initialize();
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to initialize storage';
        setError(errorMessage);
      }
    };

    initializeStorage();
  }, []);

  if (error && import.meta.env.DEV) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        <strong className="font-bold">Storage Error:</strong>
        <span className="block sm:inline"> {error}</span>
        <button
          onClick={() => setError(null)}
          className="absolute bottom-0 right-0 top-0 px-4 py-3"
        >
          <span className="text-red-500">×</span>
        </button>
      </div>
    );
  }

  return null;
};
