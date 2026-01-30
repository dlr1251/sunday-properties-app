import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      setCameraLoading(true);
      console.log('Starting camera...');

      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Tu navegador no soporta acceso a la cámara. Usa Chrome, Firefox o Safari.');
        setCameraLoading(false);
        return;
      }

      // Check if we're on HTTPS or localhost
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        toast.error('La cámara requiere HTTPS. Por favor, usa una conexión segura.');
        setCameraLoading(false);
        return;
      }

      // Request camera permission with more flexible constraints
      const constraints = {
        video: {
          facingMode: { ideal: 'user' }, // Front camera for selfies
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      };

      console.log('Requesting camera access with constraints:', constraints);

      // Request camera access with better error handling
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }

          const timeout = setTimeout(() => {
            reject(new Error('Video loading timeout'));
          }, 10000);

          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve();
          };

          videoRef.current.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Video loading error'));
          };
        });

        // Try to play the video
        try {
          await videoRef.current.play();
          setIsCapturing(true);
          setCameraLoading(false);
          console.log('Camera started successfully');
          toast.success('Cámara activada correctamente');
        } catch (playError) {
          console.error('Error playing video:', playError);
          toast.error('Error reproduciendo el video de la cámara');
          setCameraLoading(false);
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } else {
        toast.error('Error inicializando la cámara');
        setCameraLoading(false);
        mediaStream.getTracks().forEach(track => track.stop());
      }
    } catch (error: any) {
      console.error('Camera access error:', error);
      setCameraLoading(false);
      
      // Better error messages
      if (error.name === 'NotAllowedError') {
        toast.error('Permiso denegado. Por favor, permite el acceso a la cámara y recarga la página.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No se encontró una cámara en tu dispositivo.');
      } else if (error.name === 'NotReadableError') {
        toast.error('La cámara está siendo utilizada por otra aplicación. Cierra otras aplicaciones que usen la cámara.');
      } else if (error.name === 'OverconstrainedError') {
        toast.error('La cámara no soporta las configuraciones requeridas. Intenta con otra cámara.');
      } else if (error.name === 'SecurityError') {
        toast.error('Error de seguridad. Asegúrate de estar en HTTPS.');
      } else if (error.message === 'Video loading timeout') {
        toast.error('Tiempo agotado cargando la cámara. Inténtalo de nuevo.');
      } else {
        toast.error(`Error accediendo a la cámara: ${error.message || 'Error desconocido'}`);
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setCameraLoading(false);
    console.log('Camera stopped');
  }, [stream]);

  const captureSelfie = useCallback(() => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        toast.error('Error: Cámara no inicializada');
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;

      // Ensure video dimensions are available
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        toast.error('Error: Video no está listo aún. Espera un momento.');
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Error: No se pudo acceder al contexto del canvas');
        return;
      }

      // Draw the current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to JPEG with good quality
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedSelfie(dataUrl);
      stopCamera();
      toast.success('Foto capturada correctamente');
      console.log('Selfie captured successfully');
    } catch (error) {
      console.error('Error capturing selfie:', error);
      toast.error('Error capturando la foto');
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setCapturedSelfie(result);
        toast.success('Foto subida correctamente');
        console.log('File uploaded successfully');
      }
    };
    reader.onerror = () => {
      toast.error('Error leyendo el archivo');
    };
    reader.readAsDataURL(file);
  }, []);

  return {
    videoRef,
    canvasRef,
    isCapturing,
    cameraLoading,
    capturedSelfie,
    setCapturedSelfie,
    startCamera,
    stopCamera,
    captureSelfie,
    handleFileUpload,
  };
};