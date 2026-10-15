import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Search,
  Send,
  Sparkles,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  Flame,
  Award,
  Zap,
  Bookmark,
  Heart
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BatchCard } from './components/BatchCard';
import { BatchView } from './components/BatchView';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { TelegramModal } from './components/TelegramModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { getBatches, INITIAL_BATCHES, APP_LOGO, TELEGRAM_URL } from './services/api';
import { Batch } from './types';

export default function App() {
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Enrolled / Saved list from localStorage
  const [enrolledIds, setEnrolledIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('gbstudy_enrolled') || localStorage.getItem('studybee_wishlist');
      return saved ? JSON.parse(saved).map(Number) : [190, 191];
    } catch {
      return [190, 191];
    }
  });

  // Selected Batch for Course View
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

  // Modals
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [playingLecture, setPlayingLecture] = useState<{
    courseId: number | string;
    contentId: string | number;
    title: string;
    isLive?: boolean;
  } | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{
    courseId: number | string;
    contentId: string | number;
    title: string;
  } | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Show Telegram Modal on page open (per requirement)
  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('gbstudy_telegram_seen');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsTelegramModalOpen(true);
        sessionStorage.setItem('gbstudy_telegram_seen', 'true');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch batches
  useEffect(() => {
    let isMounted = true;
    setLoadingBatches(true);
    getBatches()
      .then((data) => {
        if (isMounted) setBatches(data);
      })
      .finally(() => {
        if (isMounted) setLoadingBatches(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Save enrolled IDs to localStorage
  const handleToggleEnroll = (e: React.MouseEvent, batchId: number) => {
    e.stopPropagation();
    setEnrolledIds((prev) => {
      const exists = prev.includes(batchId);
      let updated: number[];
      if (exists) {
        updated = prev.filter((id) => id !== batchId);
        showToast('Batch removed from Saved list', 'info');
      } else {
        updated = [...prev, batchId];
        showToast('Enrolled successfully! Ready to study.', 'success');
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#ec4899', '#f472b6', '#db2777', '#ffffff'],
          });
        } catch {}
      }
      localStorage.setItem('gbstudy_enrolled', JSON.stringify(updated));
      return updated;
    });
  };

  // Filter batches for homepage
  const filteredBatches = batches.filter((batch) => {
    if (activeFilterTab === 'JEE') return batch.category === 'JEE';
    if (activeFilterTab === 'NEET') return batch.category === 'NEET';
    if (activeFilterTab === '12TH') return batch.category === '12TH' || batch.target?.includes('12');
    if (activeFilterTab === '10TH') return batch.category === '10TH' || batch.target?.includes('10');
    if (activeFilterTab === 'enrolled') return enrolledIds.includes(batch.id);
    return true;
  }).filter((batch) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      batch.title.toLowerCase().includes(q) ||
      batch.category.toLowerCase().includes(q) ||
      batch.target.toLowerCase().includes(q) ||
      batch.subjects.some((s) => s.toLowerCase().includes(q))
    );
  });

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  const filterTabs = [
    { id: 'all', label: 'All Batches' },
    { id: '12TH', label: '12th Science' },
    { id: '10TH', label: '10th Topper' },
    { id: 'JEE', label: 'JEE (Main & Adv)' },
    { id: 'NEET', label: 'NEET UG' },
    { id: 'enrolled', label: `Saved (${enrolledIds.length})` },
  ];

  return (
    <div className="min-h-screen bg-[#0b070f] text-gray-100 flex flex-col selection:bg-pink-500 selection:text-white pb-20 md:pb-0 overflow-x-hidden">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1e0f26] border border-pink-500/50 shadow-[0_10px_30px_rgba(236,72,153,0.4)] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navbar (Matches Mobile Screenshot with Search, Heart, Live dot, Telegram pill) */}
      <Navbar
        currentTab={activeFilterTab}
        onTabChange={(tab) => {
          setSelectedBatchId(null);
          setActiveFilterTab(tab);
        }}
        enrolledCount={enrolledIds.length}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
        isHome={selectedBatchId === null}
        onGoHome={() => {
          setSelectedBatchId(null);
          setActiveFilterTab('all');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {selectedBatch ? (
          /* SINGLE BATCH COURSE VIEW */
          <BatchView
            batch={selectedBatch}
            onBack={() => setSelectedBatchId(null)}
            onOpenVideo={(contentId, title, isLive) =>
              setPlayingLecture({
                courseId: selectedBatch.id,
                contentId,
                title,
                isLive,
              })
            }
            onOpenPdf={(contentId, title) =>
              setViewingPdf({
                courseId: selectedBatch.id,
                contentId,
                title,
              })
            }
          />
        ) : (
          /* HOMEPAGE VIEW */
          <div className="space-y-4 sm:space-y-8 w-full">
            {/* DESKTOP HERO SECTION (Hidden on mobile for fast, direct screenshot layout) */}
            <section className="hidden md:block relative overflow-hidden pt-8 lg:pt-12 pb-8 lg:pb-12 px-6 lg:px-8 border-b border-pink-500/15 bg-gradient-to-b from-[#190c23]/80 via-[#0e0714] to-[#0b070f]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-pink-500/20 blur-[120px] rounded-full pointer-events-none" />

              <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/35 text-pink-300 text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-pink-400">
                    <img src={APP_LOGO} alt="GB STUDY" className="w-full h-full object-cover" />
                  </div>
                  <span>GB STUDY • KOTA QUALITY LEARNING</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                  Crack <span className="pink-text-gradient">Board, JEE &amp; NEET</span> With Top Batches
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  100% Free access to India's top educational batches. High-definition video lectures, chapterwise DPPs, and formula sheets without any login required.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-gray-300 pt-1">
                  <div className="flex items-center gap-1.5 text-pink-300">
                    <ShieldCheck className="w-4 h-4 text-pink-400" />
                    <span>No Login or Signup</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-pink-300">
                    <Zap className="w-4 h-4 text-pink-400" />
                    <span>High-Speed Video Streams</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-pink-300">
                    <BookOpen className="w-4 h-4 text-pink-400" />
                    <span>Complete DPPs &amp; Notes</span>
                  </div>
                </div>
              </div>
            </section>

            {/* BATCHES CONTAINER SECTION */}
            <section
              id="batches-section"
              className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6 space-y-4 sm:space-y-6"
            >
              {/* Filter Batches Search Bar (Matches Screenshot 2: Full width pill search input) */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter batches..."
                  className="w-full bg-[#160c1d] border border-pink-500/25 hover:border-pink-500/50 rounded-2xl pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-pink-300/40 focus:outline-none focus:border-pink-500/70 transition-all shadow-inner min-h-[48px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-white px-2 py-1 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter Chips / Tabs (Scrollable on small devices, wraps on desktop) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none w-full px-0.5">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilterTab(tab.id)}
                    className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                      activeFilterTab === tab.id
                        ? 'btn-pink-primary'
                        : 'bg-[#160c1d] hover:bg-[#20102a] border border-pink-500/20 text-gray-300 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Batches Grid (Adaptive Responsive Layout: 1 col on mobile, 2 cols on tablet, 3-4 cols on desktop) */}
              {filteredBatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 w-full">
                  {filteredBatches.map((batch) => (
                    <BatchCard
                      key={batch.id}
                      batch={batch}
                      isEnrolled={enrolledIds.includes(batch.id)}
                      onToggleEnroll={handleToggleEnroll}
                      onStudy={(id) => setSelectedBatchId(id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="pink-card rounded-3xl p-8 sm:p-12 text-center border border-pink-500/20 space-y-3">
                  <FolderOpen className="w-12 h-12 text-pink-400/50 mx-auto" />
                  <h3 className="text-lg font-bold text-white">No Batches Match Your Criteria</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    {activeFilterTab === 'enrolled'
                      ? 'You have not saved any batches yet. Click the heart icon on any batch to save it here.'
                      : 'Try clearing your search query to see all available batches.'}
                  </p>
                  <button
                    onClick={() => {
                      setActiveFilterTab('all');
                      setSearchQuery('');
                    }}
                    className="btn-pink-primary px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    View All Batches
                  </button>
                </div>
              )}
            </section>

            {/* TELEGRAM COMMUNITY HIGHLIGHT BANNER */}
            <section className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4">
              <div className="relative rounded-3xl overflow-hidden pink-card border border-pink-500/30 p-5 sm:p-8 lg:p-10 shadow-[0_15px_50px_rgba(236,72,153,0.25)]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/20 blur-3xl pointer-events-none rounded-full" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
                    <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)] shrink-0 bg-black p-0.5">
                      <img src={APP_LOGO} alt="GB STUDY" className="w-full h-full object-cover rounded-xl" />
                    </div>

                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-500/20 text-pink-400 border border-pink-500/30">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>100K+ Students Community</span>
                      </div>
                      <h3 className="text-lg sm:text-2xl font-black text-white">
                        Join GB STUDY Telegram Channel
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-300">
                        Daily DPP PDF solutions, chapter mind maps, lecture alerts, and exam strategy.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer')}
                    className="btn-pink-primary py-3 px-6 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 shrink-0 cursor-pointer shadow-lg w-full md:w-auto justify-center"
                  >
                    <Send className="w-4 h-4" />
                    <span>Join Telegram Now</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
        onFilterTab={(tab) => {
          setSelectedBatchId(null);
          setActiveFilterTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Mobile Bottom Navigation (Matches Screenshot: Home, Batches, Search, Telegram, Saved) */}
      <MobileBottomNav
        currentTab={activeFilterTab}
        onTabChange={(tab) => {
          setSelectedBatchId(null);
          setActiveFilterTab(tab);
        }}
        enrolledCount={enrolledIds.length}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
        onGoHome={() => {
          setSelectedBatchId(null);
          setActiveFilterTab('all');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Telegram Popup Modal */}
      <TelegramModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        batches={batches}
        onSelectBatch={(id) => {
          setSelectedBatchId(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectLecture={(batchId, contentId, title) => {
          setSelectedBatchId(batchId);
          setPlayingLecture({ courseId: batchId, contentId, title });
        }}
        onSelectPdf={(batchId, contentId, title) => {
          setSelectedBatchId(batchId);
          setViewingPdf({ courseId: batchId, contentId, title });
        }}
      />

      {/* Video Player Modal */}
      {playingLecture && (
        <VideoPlayerModal
          courseId={playingLecture.courseId}
          contentId={playingLecture.contentId}
          lectureTitle={playingLecture.title}
          isLive={playingLecture.isLive}
          onClose={() => setPlayingLecture(null)}
        />
      )}

      {/* PDF Notes Viewer Modal */}
      {viewingPdf && (
        <PdfViewerModal
          courseId={viewingPdf.courseId}
          contentId={viewingPdf.contentId}
          pdfTitle={viewingPdf.title}
          onClose={() => setViewingPdf(null)}
        />
      )}
    </div>
  );
}
