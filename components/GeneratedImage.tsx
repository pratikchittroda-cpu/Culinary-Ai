import React, { useEffect, useState } from 'react';
import { generateImage } from '../services/geminiService';

interface GeneratedImageProps {
  prompt: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export const GeneratedImage: React.FC<GeneratedImageProps> = ({ prompt, alt, className = "", aspectRatio = "aspect-video" }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchImage = async () => {
      setLoading(true);
      setError(false);
      try {
        // Use the prompt to generate an image
        const url = await generateImage(prompt);
        if (mounted) {
          if (url) {
            setImageUrl(url);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (prompt) {
      fetchImage();
    }

    return () => {
      mounted = false;
    };
  }, [prompt]);

  if (loading) {
    return (
      <div className={`${className} bg-slate-800 animate-pulse flex items-center justify-center`}>
        <svg className="w-8 h-8 text-slate-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
        <div className={`${className} bg-slate-800 flex items-center justify-center text-slate-600`}>
            <span className="text-xs">Image unavailable</span>
        </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={`${className} object-cover animate-fade-in`} 
    />
  );
};
