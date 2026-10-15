import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const REMOTE_API_BASE = 'https://studybeepro.site';

app.use(express.json());

// In-memory cache for ultra-fast response times
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Batches list fallback
const DEFAULT_BATCHES = {
  new: [
    {
      id: 190,
      title: "वरदान बैच - 12th Science Batch 2026-27",
      thumbnail: "https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/7574748_131_Class%2011th%20Mission%20Jeet%20JEE%20App%20Banners.jpg",
      category: "12TH",
      target: "12TH",
      subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
      badge: "12TH SCIENCE",
      rating: "4.9",
      students: "27.7k",
      videoCount: "844",
      notesCount: "903",
      foldersCount: "180"
    },
    {
      id: 191,
      title: "टॉपर बैच - Class 10th Batch 2026-27",
      thumbnail: "https://i.ibb.co/0R7qc34v/1093.jpg",
      category: "10TH",
      target: "10TH",
      subjects: ["Science", "Mathematics", "Social Science", "Hindi", "English"],
      badge: "10TH TOPPER",
      rating: "4.9",
      students: "25.8k",
      videoCount: "510",
      notesCount: "542",
      foldersCount: "185"
    },
    {
      id: 151,
      title: "Drona JEE class 11th",
      thumbnail: "https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/7574748_131_Class%2011th%20Mission%20Jeet%20JEE%20App%20Banners.jpg",
      category: "JEE",
      target: "Class 11th",
      subjects: ["Physics", "Chemistry", "Mathematics"],
      badge: "DRONA JEE",
      rating: "4.9",
      students: "45K+"
    },
    {
      id: 152,
      title: "Drona NEET class 11th",
      thumbnail: "https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/4072473_131_Class%2011th%20Mission%20Jeets%20NEET%20App%20Banners.jpg",
      category: "NEET",
      target: "Class 11th",
      subjects: ["Physics", "Chemistry", "Botany", "Zoology"],
      badge: "DRONA NEET",
      rating: "4.9",
      students: "52K+"
    },
    {
      id: 184,
      title: "Drona 2.0 NEET Class 11th",
      thumbnail: "https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/241318_131_drona%202.0%20NEET%20banner%20app.png",
      category: "NEET",
      target: "Class 11th",
      subjects: ["Physics", "Chemistry", "Botany", "Zoology"],
      badge: "DRONA 2.0 NEET",
      rating: "4.9",
      students: "38K+"
    },
    {
      id: 185,
      title: "Drona 2.0 JEE Class 11th",
      thumbnail: "https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/2967410_131_drona%202.0%20JEE%20banner%20app.png",
      category: "JEE",
      target: "Class 11th",
      subjects: ["Physics", "Chemistry", "Mathematics"],
      badge: "DRONA 2.0 JEE",
      rating: "4.9",
      students: "41K+"
    }
  ],
  old: []
};

// API: Batches endpoint
app.get('/api/batches', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'batches_list';
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return res.json(cached.data);
    }

    const response = await fetch(`${REMOTE_API_BASE}/mj/batches.json`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL_MS });
      return res.json(data);
    }
  } catch (err) {
    console.warn('Fallback to local batches list due to:', err);
  }

  res.json(DEFAULT_BATCHES);
});

// API: nig proxy (Course Content, Overview, Folders)
app.get('/api/nig', async (req: Request, res: Response) => {
  try {
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const cacheKey = `nig_${queryString}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return res.json(cached.data);
    }

    const targetUrl = `${REMOTE_API_BASE}/api/nig?${queryString}`;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Accept: 'application/json, text/plain, */*',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Remote API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL_MS });
    res.json(data);
  } catch (err: any) {
    console.error('Error proxying /api/nig:', err.message);
    res.status(502).json({
      success: false,
      message: 'Failed to fetch course data from upstream server',
      error: err.message,
    });
  }
});

// API: play proxy (Resolve video streams and pdf files)
app.get('/api/play', async (req: Request, res: Response) => {
  try {
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const cacheKey = `play_${queryString}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return res.json(cached.data);
    }

    const targetUrl = `${REMOTE_API_BASE}/api/play?${queryString}`;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Accept: 'application/json, text/plain, */*',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Remote play API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL_MS });
    res.json(data);
  } catch (err: any) {
    console.error('Error proxying /api/play:', err.message);
    res.status(502).json({
      success: false,
      message: 'Failed to resolve media from upstream server',
      error: err.message,
    });
  }
});

// Setup dev server with Vite or static serving in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GB STUDY server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
