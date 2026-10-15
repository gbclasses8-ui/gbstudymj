import React, { useEffect, useState } from 'react';
import { X, Download, ExternalLink, FileText, Loader2, AlertCircle } from 'lucide-react';
import { resolveMediaContent } from '../services/api';
import { ResolvedMedia } from '../types';

interface PdfViewerModalProps {
  courseId: number | string;
  contentId: string | number;
  pdfTitle: string;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  courseId,
  contentId,
  pdfTitle,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState<ResolvedMedia | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    resolveMediaContent(courseId, contentId)
      .then((data) => {
        if (!isMounted) return;
        if (data && data.decryptedData) {
          setResolved(data);
          if (!data.decryptedData.file_url) {
            setError('PDF document URL is currently unavailable.');
          }
        } else {
          setError('Could not retrieve PDF file.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to resolve PDF document');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseId, contentId]);

  const fileUrl = resolved?.decryptedData.file_url || '';
  const title = resolved?.decryptedData.title || pdfTitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl h-[90vh] bg-[#140c1a] border border-pink-500/30 rounded-2xl overflow-hidden shadow-[0_20px_70px_rgba(236,72,153,0.3)] flex flex-col">
        {/* Header Bar */}
        <div className="p-3 sm:p-4 bg-black/60 border-b border-pink-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-white truncate">{title}</h3>
          </div>

          <div className="flex items-center gap-2">
            {fileUrl && (
              <>
                <a
                  href={fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pink-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Close PDF Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame / Content Area */}
        <div className="flex-1 bg-black/40 relative flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-pink-400">
              <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
              <p className="text-sm font-semibold tracking-wide">Loading Study Material PDF...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-6 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-pink-400 mx-auto mb-3" />
              <h4 className="text-white font-bold text-base mb-1">Notice</h4>
              <p className="text-gray-300 text-xs mb-4">{error}</p>
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pink-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Direct Link</span>
                </a>
              )}
            </div>
          )}

          {!loading && !error && fileUrl && (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
              title={title}
              className="w-full h-full border-0 bg-white/5"
            />
          )}
        </div>
      </div>
    </div>
  );
};
