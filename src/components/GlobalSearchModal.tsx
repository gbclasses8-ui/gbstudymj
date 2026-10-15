import React, { useState, useEffect } from 'react';
import { Search, X, Folder, Video, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Batch } from '../types';

interface SearchItem {
  id: string;
  batchId: number;
  batchTitle: string;
  title: string;
  type: 'batch' | 'subject' | 'folder' | 'lecture' | 'notes';
  folderId?: string;
  contentId?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: Batch[];
  onSelectBatch: (batchId: number) => void;
  onSelectLecture: (batchId: number, contentId: string, title: string) => void;
  onSelectPdf: (batchId: number, contentId: string, title: string) => void;
}

const COMMON_SEARCH_INDEX: SearchItem[] = [
  // 12th & 10th Batches from Screenshot
  { id: '190-vardan', batchId: 190, batchTitle: 'वरदान बैच - 12th Science Batch 2026-27', title: 'वरदान बैच - 12th Science Board 2027', type: 'batch' },
  { id: '191-topper', batchId: 191, batchTitle: 'टॉपर बैच - Class 10th Batch 2026-27', title: 'टॉपर बैच - Class 10th Board 2027', type: 'batch' },

  // Physics chapters & items
  { id: '151-phy-wep', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Work Energy Power (Physics)', type: 'folder', folderId: '20571' },
  { id: '151-phy-circ', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Circular Motion (Physics)', type: 'folder', folderId: '19702' },
  { id: '151-phy-nlm', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Newton Laws of Motion (Physics)', type: 'folder', folderId: '18501' },
  { id: '151-phy-vec', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Vectors & Calculus (Physics)', type: 'folder', folderId: '16830' },
  { id: '151-phy-kin', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Kinematics 1D & 2D (Physics)', type: 'folder', folderId: '17520' },
  { id: '151-phy-wep-l8', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Work Energy Power L - 08', type: 'lecture', contentId: '31234' },
  { id: '151-phy-dpp-2d', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Motion in 2-D Practice Sheet (JEE)', type: 'notes', contentId: '24824' },
  { id: '151-phy-dpp-1d', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Motion in 1-D Practice Sheet (JEE)', type: 'notes', contentId: '24816' },
  { id: '151-phy-dpp-unit', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Units & Dimension Formula Sheet', type: 'notes', contentId: '24803' },
  
  // Chemistry
  { id: '151-chem-mole', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Mole Concept & Stoichiometry (Chemistry)', type: 'folder' },
  { id: '151-chem-atom', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Atomic Structure & Quantum Numbers', type: 'folder' },
  { id: '151-chem-periodic', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Periodic Table & Periodicity', type: 'folder' },
  { id: '151-chem-bonding', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Chemical Bonding & Molecular Structure', type: 'folder' },

  // Mathematics
  { id: '151-math-quad', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Quadratic Equations (Mathematics)', type: 'folder' },
  { id: '151-math-trig', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Trigonometric Ratios & Identities', type: 'folder' },
  { id: '151-math-seq', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Sequences and Series (AP, GP, HP)', type: 'folder' },
  { id: '151-math-comp', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Complex Numbers & De Moivre Theorem', type: 'folder' },

  // Biology / NEET
  { id: '152-bio-cell', batchId: 152, batchTitle: 'Drona NEET Class 11th', title: 'Cell: The Unit of Life (Botany)', type: 'folder' },
  { id: '152-bio-living', batchId: 152, batchTitle: 'Drona NEET Class 11th', title: 'The Living World (Botany)', type: 'folder' },
  { id: '152-bio-animal', batchId: 152, batchTitle: 'Drona NEET Class 11th', title: 'Animal Kingdom Classification (Zoology)', type: 'folder' },
  { id: '152-bio-struct', batchId: 152, batchTitle: 'Drona NEET Class 11th', title: 'Structural Organisation in Animals', type: 'folder' },

  // Sessions & DPP
  { id: '151-baat-shobhit', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Baatcheet Session With Shobhit Bhaiya', type: 'lecture', contentId: '30602' },
  { id: '151-mentor', batchId: 151, batchTitle: 'Drona JEE Class 11th', title: 'Mentorship Session - Strategy & Roadmap', type: 'lecture', contentId: '28474' },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  batches,
  onSelectBatch,
  onSelectLecture,
  onSelectPdf,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const query = searchTerm.toLowerCase().trim();

  // Filter batches
  const matchedBatches = batches.filter(
    (b) =>
      b.title.toLowerCase().includes(query) ||
      b.category.toLowerCase().includes(query) ||
      b.subjects.some((s) => s.toLowerCase().includes(query))
  );

  // Filter indexed items
  const matchedItems = COMMON_SEARCH_INDEX.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.batchTitle.toLowerCase().includes(query)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-[#140c1a] border border-pink-500/30 rounded-2xl overflow-hidden shadow-[0_20px_70px_rgba(236,72,153,0.35)] flex flex-col">
        {/* Search input bar */}
        <div className="p-4 border-b border-pink-500/20 flex items-center gap-3 bg-black/40">
          <Search className="w-5 h-5 text-pink-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search batches, chapters, videos, DPPs, notes..."
            autoFocus
            className="flex-1 bg-transparent text-white placeholder:text-gray-500 text-sm sm:text-base outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
          {/* Batches Section */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Available Batches</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matchedBatches.map((batch) => (
                <div
                  key={batch.id}
                  onClick={() => {
                    onSelectBatch(batch.id);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-pink-950/20 hover:bg-pink-900/40 border border-pink-500/20 hover:border-pink-500/50 cursor-pointer flex items-center gap-3 transition-all group"
                >
                  <img
                    src={batch.thumbnail}
                    alt={batch.title}
                    className="w-12 h-10 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white truncate group-hover:text-pink-300">
                      {batch.title}
                    </h5>
                    <p className="text-[10px] text-pink-400/80">{batch.target}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>

          {/* Chapters & Items Section */}
          {matchedItems.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-2 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" />
                <span>Chapters, Lectures &amp; Notes</span>
              </div>
              <div className="space-y-1.5">
                {matchedItems.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.type === 'lecture' && item.contentId) {
                        onSelectLecture(item.batchId, item.contentId, item.title);
                      } else if (item.type === 'notes' && item.contentId) {
                        onSelectPdf(item.batchId, item.contentId, item.title);
                      } else {
                        onSelectBatch(item.batchId);
                      }
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-black/40 hover:bg-pink-950/30 border border-white/5 hover:border-pink-500/30 cursor-pointer flex items-center justify-between gap-3 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-pink-500/15 text-pink-400 shrink-0">
                        {item.type === 'lecture' ? (
                          <Video className="w-4 h-4" />
                        ) : item.type === 'notes' ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Folder className="w-4 h-4" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-white group-hover:text-pink-300 truncate">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-gray-400">{item.batchTitle}</p>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20 shrink-0">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedBatches.length === 0 && matchedItems.length === 0 && (
            <div className="py-10 text-center text-gray-400 text-sm">
              No results found for "{searchTerm}". Try searching for Physics, Chemistry, NEET, or JEE.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
