import { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';

export const StorageInitializer: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await storageService.initialize();
        setInitialized(true);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to initialize storage';
        setError(errorMessage);
      }
    };

    initializeStorage();
  }, []);

  // Only show error in development
  if (error && import.meta.env.DEV) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-sm">
        <strong className="font-bold">Storage Error:</strong>
        <span className="block sm:inline"> {error}</span>
        <button
          onClick={() => setError(null)}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
        >
          <span className="text-red-500">×</span>
        </button>
      </div>
    );
  }

  // Show success indicator in development
  if (initialized && import.meta.env.DEV) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 max-w-sm">
        <strong className="font-bold">Storage:</strong>
        <span className="block sm:inline"> Initialized ✓</span>
      </div>
    );
  }

  return null;
};
