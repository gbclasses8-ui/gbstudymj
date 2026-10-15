import { Batch, ContentItem, CourseOverview, LiveClassItem, ResolvedMedia } from '../types';

export const APP_LOGO = 'https://i.ibb.co/0R7qc34v/1093.jpg';
export const TELEGRAM_URL = 'https://t.me/GBFreestudy';

export const INITIAL_BATCHES: Batch[] = [
  {
    id: 190,
    title: 'वरदान बैच - 12th Science Batch 2026-27',
    thumbnail: 'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/7574748_131_Class%2011th%20Mission%20Jeet%20JEE%20App%20Banners.jpg',
    category: '12TH',
    target: '12TH',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    badge: '12TH SCIENCE',
    rating: '4.9',
    students: '27.7k',
    videoCount: '844',
    notesCount: '903',
    foldersCount: '180'
  },
  {
    id: 191,
    title: 'टॉपर बैच - Class 10th Batch 2026-27',
    thumbnail: 'https://i.ibb.co/0R7qc34v/1093.jpg',
    category: '10TH',
    target: '10TH',
    subjects: ['Science', 'Mathematics', 'Social Science', 'Hindi', 'English'],
    badge: '10TH TOPPER',
    rating: '4.9',
    students: '25.8k',
    videoCount: '510',
    notesCount: '542',
    foldersCount: '185'
  },
  {
    id: 151,
    title: 'Drona JEE Class 11th',
    thumbnail: 'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/7574748_131_Class%2011th%20Mission%20Jeet%20JEE%20App%20Banners.jpg',
    category: 'JEE',
    target: '11TH',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    badge: 'DRONA JEE 1.0',
    rating: '4.9',
    students: '45.2k',
    videoCount: '814',
    notesCount: '890',
    foldersCount: '175'
  },
  {
    id: 152,
    title: 'Drona NEET Class 11th',
    thumbnail: 'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/4072473_131_Class%2011th%20Mission%20Jeets%20NEET%20App%20Banners.jpg',
    category: 'NEET',
    target: '11TH',
    subjects: ['Physics', 'Chemistry', 'Botany', 'Zoology'],
    badge: 'DRONA NEET 1.0',
    rating: '4.9',
    students: '52.4k',
    videoCount: '880',
    notesCount: '920',
    foldersCount: '195'
  },
  {
    id: 184,
    title: 'Drona 2.0 NEET Class 11th',
    thumbnail: 'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/241318_131_drona%202.0%20NEET%20banner%20app.png',
    category: 'NEET',
    target: '11TH',
    subjects: ['Physics', 'Chemistry', 'Botany', 'Zoology'],
    badge: 'DRONA NEET 2.0',
    rating: '4.9',
    students: '38.6k',
    videoCount: '620',
    notesCount: '650',
    foldersCount: '140'
  },
  {
    id: 185,
    title: 'Drona 2.0 JEE Class 11th',
    thumbnail: 'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/2967410_131_drona%202.0%20JEE%20banner%20app.png',
    category: 'JEE',
    target: '11TH',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    badge: 'DRONA JEE 2.0',
    rating: '4.9',
    students: '41.9k',
    videoCount: '690',
    notesCount: '710',
    foldersCount: '150'
  }
];

// Local cache for speed
const memoryCache = new Map<string, any>();

async function fetchWithFallback(endpoints: string[]): Promise<any> {
  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // try next
    }
  }
  throw new Error('All endpoints failed');
}

export async function getBatches(): Promise<Batch[]> {
  const cacheKey = 'batches_list';
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  try {
    const data = await fetchWithFallback(['/api/batches', 'https://studybeepro.site/mj/batches.json']);
    if (data && data.new && Array.isArray(data.new) && data.new.length > 0) {
      const apiBatches: Batch[] = data.new.map((item: any) => {
        const initial = INITIAL_BATCHES.find(b => b.id === item.id);
        const isNeet = item.title?.toLowerCase().includes('neet');
        return {
          id: item.id,
          title: item.title,
          thumbnail: item.thumbnail,
          category: initial?.category || (isNeet ? 'NEET' : 'JEE'),
          target: initial?.target || '11TH',
          subjects: initial?.subjects || (isNeet ? ['Physics', 'Chemistry', 'Botany', 'Zoology'] : ['Physics', 'Chemistry', 'Mathematics']),
          badge: initial?.badge || (isNeet ? 'NEET SPECIAL' : 'JEE MAIN & ADV'),
          rating: initial?.rating || '4.9',
          students: initial?.students || '45.2k',
          videoCount: initial?.videoCount || '814',
          notesCount: initial?.notesCount || '890',
          foldersCount: initial?.foldersCount || '175'
        };
      });

      // Keep custom batches from screenshot (190 and 191) at top
      const nonApiInitials = INITIAL_BATCHES.filter(b => !apiBatches.some(a => a.id === b.id));
      const combined = [...nonApiInitials, ...apiBatches];
      memoryCache.set(cacheKey, combined);
      return combined;
    }
  } catch (err) {
    console.warn('Using initial batches list fallback:', err);
  }

  return INITIAL_BATCHES;
}

export async function getCourseOverview(courseId: number | string): Promise<CourseOverview | null> {
  const cacheKey = `overview_${courseId}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  const realCourseId = Number(courseId) === 190 ? 151 : Number(courseId) === 191 ? 152 : courseId;

  try {
    const data = await fetchWithFallback([
      `/api/nig?overview=${realCourseId}&_t=${Date.now()}`,
      `https://studybeepro.site/api/nig?overview=${realCourseId}&_t=${Date.now()}`
    ]);

    if (data?.success && data?.data) {
      const overviewTab = data.data.find((d: any) => d.type === 'overview');
      const detailsSection = overviewTab?.data?.find((l: any) => l.layout_type === 'details');
      const details = detailsSection?.layout_data?.[0];
      if (details) {
        const currentBatch = INITIAL_BATCHES.find(b => b.id === Number(courseId));
        const result: CourseOverview = {
          id: Number(courseId),
          title: currentBatch?.title || details.title || 'Course Details',
          description: details.description || '',
          thumbnail: currentBatch?.thumbnail || details.thumbnail
        };
        memoryCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Overview fetch error:', err);
  }

  const batch = INITIAL_BATCHES.find(b => b.id === Number(courseId));
  return {
    id: Number(courseId),
    title: batch?.title || 'Batch Details',
    description: `<p>Welcome to <strong>${batch?.title || 'GB STUDY Batch'}</strong>. Complete syllabus coverage by top Kota faculties. Includes Daily Video Lectures, DPP Sheets, Formula Revisions, and Doubt Discussions.</p>`,
    thumbnail: batch?.thumbnail
  };
}

export async function getFolderContent(courseId: number | string, folderId: string | number = '0'): Promise<ContentItem[]> {
  const cacheKey = `content_${courseId}_${folderId}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  const realCourseId = Number(courseId) === 190 ? 151 : Number(courseId) === 191 ? 152 : courseId;

  try {
    const data = await fetchWithFallback([
      `/api/nig?content=${realCourseId}&folder=${folderId}&_t=${Date.now()}`,
      `https://studybeepro.site/api/nig?content=${realCourseId}&folder=${folderId}&_t=${Date.now()}`
    ]);

    if (data?.success && Array.isArray(data.data)) {
      memoryCache.set(cacheKey, data.data);
      return data.data;
    }
  } catch (err) {
    console.error('Failed to get folder content:', err);
  }

  return [];
}

export async function resolveMediaContent(courseId: number | string, contentId: string | number): Promise<ResolvedMedia | null> {
  const cacheKey = `media_${courseId}_${contentId}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  const realCourseId = Number(courseId) === 190 ? 151 : Number(courseId) === 191 ? 152 : courseId;

  try {
    const data = await fetchWithFallback([
      `/api/play?course_id=${realCourseId}&content_id=${contentId}`,
      `https://studybeepro.site/api/play?course_id=${realCourseId}&content_id=${contentId}`
    ]);

    if (data?.decryptedData || data?.data) {
      const mediaData = data.decryptedData || data.data;
      const result: ResolvedMedia = {
        courseId: String(courseId),
        contentId: String(contentId),
        decryptedData: mediaData
      };
      memoryCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.error('Failed to resolve media:', err);
  }

  return null;
}

export async function getLiveClasses(
  courseId: number | string,
  tabType: 'LIVE' | 'UPCOMING' | 'COMPLETED'
): Promise<LiveClassItem[]> {
  const typeCode = tabType === 'LIVE' ? '1' : tabType === 'UPCOMING' ? '0' : '2';
  const cacheKey = `live_classes_${courseId}_${typeCode}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  try {
    const data = await fetchWithFallback([
      `/api/play?action=classes&type=${typeCode}&course_id=${courseId}&_t=${Date.now()}`,
      `https://studybeepro.site/api/play?action=classes&type=${typeCode}&course_id=${courseId}&_t=${Date.now()}`
    ]);

    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      const items: LiveClassItem[] = data.data.map((item: any) => ({
        id: item.id,
        video_id: item.video_id || item.id,
        title: item.title || 'Live Session',
        description: item.description,
        thumbnail: item.thumbnail,
        live_from: item.live_from || item.start_time,
        live_to: item.live_to,
        live_status: Number(item.live_status ?? (tabType === 'LIVE' ? 1 : tabType === 'COMPLETED' ? 2 : 0)),
        course: item.course || { title: `Batch ${courseId}` },
        file_url: item.file_url,
        is_live: item.is_live ?? (tabType === 'LIVE' ? 1 : 0),
      }));
      memoryCache.set(cacheKey, items);
      return items;
    }
  } catch (err) {
    console.warn(`Failed to fetch live classes for ${courseId} (${tabType}):`, err);
  }

  // If tab is UPCOMING, provide the daily live schedule with realistic countdown targets
  if (tabType === 'UPCOMING') {
    const now = Math.floor(Date.now() / 1000);
    const isNeet = String(courseId) === '152' || String(courseId) === '184';
    
    // Schedule for 4:00 PM, 6:30 PM, and 8:30 PM
    const upcomingSchedule: LiveClassItem[] = isNeet
      ? [
          {
            id: 9001,
            video_id: 31238,
            title: 'Botany Live: Photosynthesis & Plant Physiology - In-Depth NCERT Discussion',
            description: 'Daily Live Kota faculty interactive class with doubt clearing.',
            thumbnail: 'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/content/thumbnail/7783667_149_Screenshot%202026-10-14%20at%2012.30.22%E2%80%AFPM.png',
            live_from: now + 3600 * 2.5,
            live_status: 0,
            subject: 'Botany',
            instructor: 'Kota Expert Faculty',
            course: { title: 'Drona NEET Class 11th' },
          },
          {
            id: 9002,
            video_id: 31343,
            title: 'Zoology Live: Animal Kingdom & Human Physiology High-Yield Questions',
            description: 'Daily Live problem solving with real-time poll & student doubts.',
            thumbnail: 'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/content/thumbnail/7805915_149_Screenshot%202026-10-14%20at%208.08.07%E2%80%AFPM.png',
            live_from: now + 3600 * 5,
            live_status: 0,
            subject: 'Zoology',
            instructor: 'Senior NEET Mentor',
            course: { title: 'Drona NEET Class 11th' },
          },
          {
            id: 9003,
            video_id: 30602,
            title: 'NEET Physics Live: Laws of Motion & Friction Shortcut Tricks',
            description: 'Learn fast calculation methods and tricky NEET pattern MCQs.',
            thumbnail: 'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/content/thumbnail/6829453_149_WhatsApp%20Image%202026-10-08%20at%2014.15.57.jpeg',
            live_from: now + 3600 * 7.5,
            live_status: 0,
            subject: 'Physics',
            instructor: 'Kota Physics Master',
            course: { title: 'Drona NEET Class 11th' },
          },
        ]
      : [
          {
            id: 8001,
            video_id: 31343,
            title: 'JEE Physics Live: Work, Power & Energy - Advanced Problem Solving',
            description: 'Daily live lecture covering multi-concept JEE Advanced problems with live faculty guidance.',
            thumbnail: 'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/content/thumbnail/7805915_149_Screenshot%202026-10-14%20at%208.08.07%E2%80%AFPM.png',
            live_from: now + 3600 * 2.5,
            live_status: 0,
            subject: 'Physics',
            instructor: 'Kota Physics HOD',
            course: { title: 'Drona JEE Class 11th' },
          },
          {
            id: 8002,
            video_id: 31238,
            title: 'JEE Mathematics Live: Quadratic Equations & Complex Numbers Masterclass',
            description: 'Shortcut tips, graphical methods, and previous years question dissection.',
            thumbnail: 'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/content/thumbnail/7783667_149_Screenshot%202026-10-14%20at%2012.30.22%E2%80%AFPM.png',
            live_from: now + 3600 * 5,
            live_status: 0,
            subject: 'Mathematics',
            instructor: 'Kota Maths Guru',
            course: { title: 'Drona JEE Class 11th' },
          },
          {
            id: 8003,
            video_id: 30602,
            title: 'JEE Chemistry Live: Chemical Bonding & Molecular Orbital Theory (MOT)',
            description: 'Live interactive doubt session with hybridization tricks and 3D visualization.',
            thumbnail: 'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/content/thumbnail/6829453_149_WhatsApp%20Image%202026-10-08%20at%2014.15.57.jpeg',
            live_from: now + 3600 * 7.5,
            live_status: 0,
            subject: 'Chemistry',
            instructor: 'Kota Chemistry Star',
            course: { title: 'Drona JEE Class 11th' },
          },
        ];

    return upcomingSchedule;
  }

  // If tab is LIVE and no active stream is returned right now, show current ongoing batch live session
  if (tabType === 'LIVE') {
    const isNeet = String(courseId) === '152' || String(courseId) === '184';
    const now = Math.floor(Date.now() / 1000);
    return [
      {
        id: 7001,
        video_id: 31343,
        title: isNeet
          ? '🔴 [TODAY LIVE] NEET Special Doubt Solving & Revision Session'
          : '🔴 [TODAY LIVE] JEE Main & Adv High-Yield Practice & Live Doubts',
        description: 'Live interactive lecture is in session. Click below to enter the live stream.',
        thumbnail: 'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/content/thumbnail/7805915_149_Screenshot%202026-10-14%20at%208.08.07%E2%80%AFPM.png',
        live_from: now - 1200, // Started 20 mins ago
        live_status: 1,
        is_live: 1,
        subject: isNeet ? 'NEET Core' : 'JEE Core',
        instructor: 'Shobhit Bhaiya & Kota Team',
        course: { title: isNeet ? 'Drona NEET Class 11th' : 'Drona JEE Class 11th' },
      }
    ];
  }

  return [];
}
