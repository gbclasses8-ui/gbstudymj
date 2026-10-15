import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  AlertCircle,
  Loader2,
  ExternalLink,
  FastForward
} from 'lucide-react';
import { resolveMediaContent } from '../services/api';
import { ResolvedMedia } from '../types';

interface VideoPlayerModalProps {
  courseId: number | string;
  contentId: string | number;
  lectureTitle: string;
  isLive?: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  courseId,
  contentId,
  lectureTitle,
  isLive = false,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState<ResolvedMedia | null>(null);

  // Player controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    resolveMediaContent(courseId, contentId)
      .then((data) => {
        if (!isMounted) return;
        if (data && data.decryptedData) {
          setResolved(data);
          const rawUrl = data.decryptedData.file_url;
          if (!rawUrl && !data.decryptedData.download_urls?.length) {
            setError('This lecture video stream is currently being processed or unavailable.');
          }
        } else {
          setError('Could not retrieve video stream. Please try again or download.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load video stream');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseId, contentId]);

  // Initialize Video & HLS
  useEffect(() => {
    if (!resolved || !videoRef.current) return;

    const fileUrl = resolved.decryptedData.file_url || '';
    if (!fileUrl) return;

    let hls: Hls | null = null;
    const video = videoRef.current;

    // Check if YouTube
    const isYouTube =
      resolved.decryptedData.video_type === 1 ||
      fileUrl.includes('youtube.com') ||
      fileUrl.includes('youtu.be');

    if (isYouTube) return;

    if (fileUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(fileUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.warn('HLS Fatal Error, trying native or download fallback:', data);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = fileUrl;
        video.play().catch(() => {});
      }
    } else {
      video.src = fileUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [resolved]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
  };

  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([^?&#]+)/);
    return match ? match[1] : url;
  };

  const fileUrl = resolved?.decryptedData.file_url || '';
  const isYouTube =
    resolved?.decryptedData.video_type === 1 ||
    fileUrl.includes('youtube.com') ||
    fileUrl.includes('youtu.be');
  const youtubeId = isYouTube ? getYouTubeId(fileUrl) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative z-10 w-full max-w-5xl bg-[#120a17] border border-pink-500/30 rounded-2xl overflow-hidden shadow-[0_20px_70px_rgba(236,72,153,0.3)] flex flex-col max-h-[95vh]"
      >
        {/* Top Header Bar */}
        <div className="p-3 sm:p-4 bg-black/60 border-b border-pink-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden">
            {(isLive || resolved?.decryptedData.is_live === 1) ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(225,29,72,0.6)] shrink-0 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                LIVE
              </span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse shrink-0" />
            )}
            <h3 className="font-bold text-sm sm:text-base text-white truncate">
              {resolved?.decryptedData.title || lectureTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
            aria-label="Close Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Display Container */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-pink-400">
              <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
              <p className="text-sm font-semibold tracking-wide">Resolving High-Speed Stream...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-6 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-pink-400 mx-auto mb-3" />
              <h4 className="text-white font-bold text-base mb-1">Playback Notice</h4>
              <p className="text-gray-300 text-xs mb-4">{error}</p>
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pink-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Video Directly</span>
                </a>
              )}
            </div>
          )}

          {!loading && !error && isYouTube && youtubeId && (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title="YouTube video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {!loading && !error && !isYouTube && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                  }
                }}
                playsInline
              />

              {/* Center Play/Pause button on overlay */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-pink-500/90 hover:bg-pink-500 text-white flex items-center justify-center pl-1 shadow-[0_0_30px_rgba(236,72,153,0.7)] transition-all transform hover:scale-110">
                    <Play className="w-8 h-8 fill-white" />
                  </div>
                </div>
              )}

              {/* Bottom Custom Control Bar */}
              <div
                className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 sm:p-4 transition-opacity duration-300 ${
                  showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Timeline Scrubber */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCurrentTime(val);
                      if (videoRef.current) videoRef.current.currentTime = val;
                    }}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between gap-2 text-white">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className="p-1.5 hover:text-pink-400 transition-colors"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>

                    {/* Rewind 10s */}
                    <button
                      onClick={() => skipSeconds(-10)}
                      className="p-1.5 hover:text-pink-400 transition-colors"
                      title="Rewind 10s"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Forward 10s */}
                    <button
                      onClick={() => skipSeconds(10)}
                      className="p-1.5 hover:text-pink-400 transition-colors"
                      title="Forward 10s"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Volume */}
                    <button
                      onClick={toggleMute}
                      className="p-1.5 hover:text-pink-400 transition-colors"
                      aria-label="Volume"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Current / Total Time */}
                    <span className="text-xs font-mono text-gray-300">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Speed Selector Buttons */}
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 text-xs">
                      {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-1.5 py-0.5 rounded transition-colors ${
                            playbackRate === spd
                              ? 'bg-pink-500 text-white font-bold'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-1.5 hover:text-pink-400 transition-colors"
                      aria-label="Fullscreen"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Download Resolutions / Fallback options */}
        {resolved?.decryptedData.download_urls && resolved.decryptedData.download_urls.length > 0 && (
          <div className="p-3 sm:p-4 bg-[#180e22] border-t border-pink-500/20 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-pink-300 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-pink-400" />
              <span>Offline Download Quality:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {resolved.decryptedData.download_urls.map((dl, idx) => (
                <a
                  key={idx}
                  href={dl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-pink-500/15 hover:bg-pink-500 text-pink-300 hover:text-white border border-pink-500/30 transition-all flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>{dl.title}p</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
