import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { defaultBooks, defaultAuthorBio } from "./src/data/defaultBooks.js";
import { defaultUiTexts } from "./src/data/defaultUiTexts.js";
import { Book, AuthorBio, UiTexts, SecurityAlert, Post, PostComment, InteractionSchedule } from "./src/types.js";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Set high JSON body parser limit to support PDF and cover base64 uploads
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "src", "data", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface DatabaseSchema {
  books: Book[];
  author: AuthorBio;
  uiTexts?: UiTexts;
  adminPassword?: string;
  failedAttemptsCount?: number;
  lockoutUntil?: number;
  securityAlerts?: SecurityAlert[];
  posts?: Post[];
  interactionSchedules?: InteractionSchedule[];
}

const defaultPosts: Post[] = [
  {
    id: "post-1",
    contentEn: "Welcome to my official library and thought hub! Here I will share excerpts from my upcoming works, insights into the writing process, and direct updates on my literary journey. Thank you for being a part of this voyage.",
    contentAr: "مرحباً بكم في منصتي الأدبية الرسمية ومستودع أفكاري! هنا سأشارككم مقتطفات من أعمالي القادمة، ورؤى حول عملية الكتابة، وتحديثات مباشرة عن رحلتي الأدبية. شكراً لكونكم جزءاً من هذه الرحلة.",
    createdAt: 1783220400000,
    likes: 42,
    views: 284,
    comments: [
      {
        id: "comment-1",
        authorName: "Sarah M.",
        content: "So excited to have a central place to connect with your writing!",
        createdAt: 1783221000000
      },
      {
        id: "comment-2",
        authorName: "أحمد علي",
        content: "بالتوفيق دائماً، بانتظار كتاباتك القادمة بشوق.",
        createdAt: 1783222000000
      }
    ]
  },
  {
    id: "post-2",
    contentEn: "The silence between chapters is where the next story resides. What themes would you like to see explored in my next collection of essays or novels?",
    contentAr: "الصمت بين الفصول هو المكان الذي تسكن فيه القصة التالية. ما هي المواضيع التي تودون رؤيتها مستكشفة في مجموعتي القادمة من المقالات أو الروايات؟",
    createdAt: 1783242000000,
    likes: 29,
    views: 147,
    comments: []
  }
];


// Ensure database file exists
function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const parentDir = path.dirname(DB_PATH);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      
      const initialDb: DatabaseSchema = {
        books: defaultBooks,
        author: defaultAuthorBio,
        uiTexts: defaultUiTexts,
        failedAttemptsCount: 0,
        lockoutUntil: 0,
        securityAlerts: [],
        posts: defaultPosts,
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), "utf8");
      return initialDb;
    }

    const rawData = fs.readFileSync(DB_PATH, "utf8");
    const data = JSON.parse(rawData);
    
    // Ensure keys exist
    if (!data.books) data.books = defaultBooks;
    if (!data.author) {
      data.author = defaultAuthorBio;
    } else {
      if (data.author.avatars === undefined) data.author.avatars = [];
      if (data.author.videoUrl === undefined) data.author.videoUrl = '';
      if (data.author.showSlideshow === undefined) data.author.showSlideshow = true;
      if (data.author.slideshowSpeed === undefined) data.author.slideshowSpeed = 4;
      if (data.author.imageOpacity === undefined) data.author.imageOpacity = 100;
      if (data.author.imageBlur === undefined) data.author.imageBlur = 0;
      if (data.author.imageContrast === undefined) data.author.imageContrast = 100;
      if (data.author.imageBrightness === undefined) data.author.imageBrightness = 100;
      
      if (data.author.contactFeature === undefined) {
        data.author.contactFeature = JSON.parse(JSON.stringify(defaultAuthorBio.contactFeature));
      } else {
        const cf = data.author.contactFeature;
        if (cf.enableFeature === undefined) cf.enableFeature = true;
        if (cf.hideFromControlPanel === undefined) cf.hideFromControlPanel = false;
        if (cf.titleEn === undefined) cf.titleEn = 'Contact the Author';
        if (cf.titleAr === undefined) cf.titleAr = 'اتصل بالكاتب';
        if (cf.descriptionEn === undefined) cf.descriptionEn = 'Feel free to reach out to the author for inquiries, collaborations, or literary discussions.';
        if (cf.descriptionAr === undefined) cf.descriptionAr = 'لا تتردد في التواصل مع الكاتب للاستفسارات، والتعاون المشترك، أو المناقشات الأدبية.';
        if (cf.phone === undefined) cf.phone = { value: '+1 (555) 019-2834', visible: true };
        if (cf.email === undefined) cf.email = { value: 'info@coma-journey.com', visible: true };
        if (cf.instagram === undefined) cf.instagram = { value: 'https://instagram.com', visible: true };
        if (cf.facebook === undefined) cf.facebook = { value: 'https://facebook.com', visible: true };
        if (cf.tiktok === undefined) cf.tiktok = { value: 'https://tiktok.com', visible: false };
        if (cf.other === undefined) cf.other = { value: '', visible: false };
        if (cf.otherLabelEn === undefined) cf.otherLabelEn = 'Other Platform';
        if (cf.otherLabelAr === undefined) cf.otherLabelAr = 'منصة أخرى';
        if (cf.showInHeader === undefined) cf.showInHeader = true;
        if (cf.showInHero === undefined) cf.showInHero = true;
      }
    }
    if (!data.uiTexts) {
      data.uiTexts = defaultUiTexts;
    } else {
      if (data.uiTexts.showVisitorCounter === undefined) data.uiTexts.showVisitorCounter = true;
      if (data.uiTexts.visitorCount === undefined) data.uiTexts.visitorCount = 1428;
      if (data.uiTexts.showBookRatingFeature === undefined) data.uiTexts.showBookRatingFeature = true;
      if (data.uiTexts.showDirectDownloadLibrary === undefined) data.uiTexts.showDirectDownloadLibrary = true;
      if (data.uiTexts.topCustomImageUrl === undefined) data.uiTexts.topCustomImageUrl = '';
      if (data.uiTexts.topCustomImageOpacity === undefined) data.uiTexts.topCustomImageOpacity = 35;
      if (data.uiTexts.topCustomImageBlur === undefined) data.uiTexts.topCustomImageBlur = 0;
      if (data.uiTexts.topCustomImageContrast === undefined) data.uiTexts.topCustomImageContrast = 100;
      if (data.uiTexts.topCustomImageBrightness === undefined) data.uiTexts.topCustomImageBrightness = 60;
      if (data.uiTexts.globalFontSize === undefined) data.uiTexts.globalFontSize = 100;
      if (data.uiTexts.globalContrast === undefined) data.uiTexts.globalContrast = 'normal';
      if (data.uiTexts.postsTitleEn === undefined) data.uiTexts.postsTitleEn = 'Interaction & Social Feed';
      if (data.uiTexts.postsTitleAr === undefined) data.uiTexts.postsTitleAr = 'منصة التفاعل والمنشورات';
      if (data.uiTexts.postsSubtitleEn === undefined) data.uiTexts.postsSubtitleEn = 'Latest news, thoughts, and daily updates';
      if (data.uiTexts.postsSubtitleAr === undefined) data.uiTexts.postsSubtitleAr = 'آخر الأخبار، الخواطر والتحديثات اليومية';
      if (data.uiTexts.hidePostsHeaderText === undefined) data.uiTexts.hidePostsHeaderText = false;
      if (data.uiTexts.showLogoInPostHeader === undefined) data.uiTexts.showLogoInPostHeader = false;
      if (data.uiTexts.postsLogoUrl === undefined) data.uiTexts.postsLogoUrl = '';
      if (data.uiTexts.creamyThemeMode === undefined) data.uiTexts.creamyThemeMode = false;
      if (data.uiTexts.showVerifiedBadgeInHeader === undefined) data.uiTexts.showVerifiedBadgeInHeader = true;
    }
    if (data.failedAttemptsCount === undefined) data.failedAttemptsCount = 0;
    if (data.lockoutUntil === undefined) data.lockoutUntil = 0;
    if (!data.securityAlerts) data.securityAlerts = [];
    if (!data.interactionSchedules) data.interactionSchedules = [];
    if (!data.posts) {
      data.posts = defaultPosts;
    } else {
      data.posts.forEach((p: Post) => {
        if (p.views === undefined) {
          p.views = 0;
        }
      });
    }
    
    return data;
  } catch (error) {
    console.error("Error loading database, returning defaults:", error);
    return {
      books: defaultBooks,
      author: defaultAuthorBio,
      uiTexts: defaultUiTexts,
      failedAttemptsCount: 0,
      lockoutUntil: 0,
      securityAlerts: [],
    };
  }
}

// Initialize db synchronously first
let db = loadDatabase();

// Initialize Firebase
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig = null;
if (fs.existsSync(firebaseConfigPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
  } catch (err) {
    console.error("Error reading firebase config:", err);
  }
}

let firestoreDb: any = null;
if (firebaseConfig) {
  try {
    const firebaseApp = initializeApp(firebaseConfig);
    const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
    firestoreDb = getFirestore(firebaseApp, dbId);
    console.log("Firestore initialized successfully with database ID:", dbId);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
}

async function saveToFirestore(data: DatabaseSchema) {
  if (!firestoreDb) return;
  try {
    const docKeys = ["books", "author", "uiTexts", "posts", "interactionSchedules", "security"];
    for (const key of docKeys) {
      const docRef = doc(firestoreDb, "app_data", key);
      let payload: any = {};
      if (key === "books") {
        payload = { items: data.books || [] };
      } else if (key === "posts") {
        payload = { items: data.posts || [] };
      } else if (key === "interactionSchedules") {
        payload = { items: data.interactionSchedules || [] };
      } else if (key === "security") {
        payload = {
          adminPassword: data.adminPassword || "",
          failedAttemptsCount: data.failedAttemptsCount || 0,
          lockoutUntil: data.lockoutUntil || 0,
          securityAlerts: data.securityAlerts || []
        };
      } else if (key === "author") {
        payload = data.author || {};
      } else if (key === "uiTexts") {
        payload = data.uiTexts || {};
      }
      await setDoc(docRef, payload);
    }
    console.log("Successfully backed up state to Firestore.");
  } catch (error) {
    console.error("Error saving state to Firestore:", error);
  }
}

async function syncWithFirestore() {
  if (!firestoreDb) return;
  console.log("Syncing with Firestore...");
  try {
    const docKeys = ["books", "author", "uiTexts", "posts", "interactionSchedules", "security"];
    const loadedData: Partial<DatabaseSchema> = {};

    for (const key of docKeys) {
      const docRef = doc(firestoreDb, "app_data", key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const docData = docSnap.data();
        if (key === "books") {
          loadedData.books = docData.items;
        } else if (key === "posts") {
          loadedData.posts = docData.items;
        } else if (key === "interactionSchedules") {
          loadedData.interactionSchedules = docData.items;
        } else if (key === "security") {
          loadedData.adminPassword = docData.adminPassword;
          loadedData.failedAttemptsCount = docData.failedAttemptsCount;
          loadedData.lockoutUntil = docData.lockoutUntil;
          loadedData.securityAlerts = docData.securityAlerts;
        } else if (key === "author") {
          loadedData.author = docData as AuthorBio;
        } else if (key === "uiTexts") {
          loadedData.uiTexts = docData as UiTexts;
        }
      }
    }

    let hasAnyData = false;
    if (loadedData.books && loadedData.books.length > 0) { db.books = loadedData.books; hasAnyData = true; }
    if (loadedData.author) { db.author = loadedData.author; hasAnyData = true; }
    if (loadedData.uiTexts) { db.uiTexts = loadedData.uiTexts; hasAnyData = true; }
    if (loadedData.posts && loadedData.posts.length > 0) { db.posts = loadedData.posts; hasAnyData = true; }
    if (loadedData.interactionSchedules) { db.interactionSchedules = loadedData.interactionSchedules; hasAnyData = true; }
    if (loadedData.adminPassword !== undefined) { db.adminPassword = loadedData.adminPassword; hasAnyData = true; }
    if (loadedData.failedAttemptsCount !== undefined) db.failedAttemptsCount = loadedData.failedAttemptsCount;
    if (loadedData.lockoutUntil !== undefined) db.lockoutUntil = loadedData.lockoutUntil;
    if (loadedData.securityAlerts !== undefined) db.securityAlerts = loadedData.securityAlerts;

    if (!hasAnyData) {
      console.log("Firestore is empty. Uploading default/local data to Firestore...");
      await saveToFirestore(db);
    } else {
      console.log("Successfully loaded state from Firestore.");
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
    }
  } catch (error) {
    console.error("Error loading data from Firestore, falling back to local file:", error);
  }
}

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
    saveToFirestore(data).catch((err) => console.error("Async Firestore save failed:", err));
  } catch (error) {
    console.error("Error saving database:", error);
  }
}

// Background worker to gradually deliver views and likes (mimics real traffic)
function processInteractionSchedules() {
  if (!db.interactionSchedules || db.interactionSchedules.length === 0) return;
  
  let hasUpdates = false;
  const now = Date.now();
  
  db.interactionSchedules.forEach((schedule) => {
    if (schedule.completed) return;
    
    if (!db.posts) db.posts = [];
    const post = db.posts.find(p => p.id === schedule.postId);
    if (!post) {
      schedule.completed = true;
      hasUpdates = true;
      return;
    }
    
    const durationMs = schedule.durationMinutes * 60 * 1000;
    const elapsedMs = now - schedule.startedAt;
    
    if (elapsedMs >= durationMs) {
      // Completed! Add remaining views and likes to reach targets perfectly
      const remainingViews = Math.max(0, schedule.targetViewsToAdd - schedule.addedViews);
      const remainingLikes = Math.max(0, schedule.targetLikesToAdd - schedule.addedLikes);
      
      post.views = (post.views || 0) + remainingViews;
      post.likes = (post.likes || 0) + remainingLikes;
      
      schedule.addedViews = schedule.targetViewsToAdd;
      schedule.addedLikes = schedule.targetLikesToAdd;
      schedule.completed = true;
      schedule.lastUpdateAt = now;
      hasUpdates = true;
    } else {
      // Calculate fraction of elapsed time
      const fraction = elapsedMs / durationMs;
      
      // Calculate target progressive counts at this specific point in time
      const targetViewsAcc = Math.min(schedule.targetViewsToAdd, Math.floor(fraction * schedule.targetViewsToAdd));
      const targetLikesAcc = Math.min(schedule.targetLikesToAdd, Math.floor(fraction * schedule.targetLikesToAdd));
      
      const deltaViews = Math.max(0, targetViewsAcc - schedule.addedViews);
      const deltaLikes = Math.max(0, targetLikesAcc - schedule.addedLikes);
      
      if (deltaViews > 0 || deltaLikes > 0) {
        post.views = (post.views || 0) + deltaViews;
        post.likes = (post.likes || 0) + deltaLikes;
        
        schedule.addedViews += deltaViews;
        schedule.addedLikes += deltaLikes;
        schedule.lastUpdateAt = now;
        hasUpdates = true;
      }
    }
  });
  
  if (hasUpdates) {
    saveDatabase(db);
  }
}

// Run scheduler every 5 seconds to deliver traffic smoothly and gradually
setInterval(processInteractionSchedules, 5000);

// ----------------------
// API ROUTES
// ----------------------

// 1. Authenticate Admin with lockouts & notifications
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "Unknown Browser";

  // Check lockout status
  const now = Date.now();
  if (db.lockoutUntil && db.lockoutUntil > now) {
    const minutesLeft = Math.ceil((db.lockoutUntil - now) / (60 * 1000));
    return res.status(403).json({
      success: false,
      isLockedOut: true,
      messageEn: `Too many failed login attempts. Account locked for security. Try again in ${minutesLeft} minute(s).`,
      messageAr: `محاولات تسجيل دخول خاطئة متعددة. تم قفل الحساب لدواعي الأمان. يرجى المحاولة مرة أخرى بعد ${minutesLeft} دقيقة.`
    });
  }

  const storedPassword = db.adminPassword || process.env.ADMIN_PASSWORD || "DrSarah_Coma_Journey_2026!";
  const cleanInput = (password || "").trim();
  const cleanStored = (storedPassword || "").trim();

  if (cleanInput === cleanStored) {
    // Reset on success
    db.failedAttemptsCount = 0;
    db.lockoutUntil = 0;
    
    // Log successful login security entry if there were prior failures
    const priorFailures = db.securityAlerts?.filter(a => !a.resolved && a.type !== 'password_changed').length || 0;
    if (priorFailures > 0) {
      const successAlert: SecurityAlert = {
        id: "alert-success-" + now,
        timestamp: now,
        ipAddress,
        userAgent,
        type: "password_changed", // generic safe log category
        resolved: false,
        attemptedPassword: "--- SUCCESSFUL LOGIN ---"
      };
      db.securityAlerts = [successAlert, ...(db.securityAlerts || [])];
    }

    saveDatabase(db);
    return res.json({ success: true, token: "coma_secure_token_2026" });
  }

  // Failed attempt
  const currentFailures = (db.failedAttemptsCount || 0) + 1;
  db.failedAttemptsCount = currentFailures;

  const failedAlert: SecurityAlert = {
    id: "alert-fail-" + now + "-" + Math.floor(Math.random() * 1000),
    timestamp: now,
    ipAddress,
    userAgent,
    attemptedPassword: cleanInput ? cleanInput.substring(0, 30) : "(empty)",
    type: "failed_attempt",
    resolved: false
  };

  if (!db.securityAlerts) db.securityAlerts = [];
  db.securityAlerts.unshift(failedAlert);

  if (currentFailures >= 5) {
    // Lockout for 15 minutes
    db.lockoutUntil = now + 15 * 60 * 1000;
    
    const lockoutAlert: SecurityAlert = {
      id: "alert-lockout-" + now,
      timestamp: now,
      ipAddress,
      userAgent,
      type: "lockout",
      resolved: false,
      attemptedPassword: `--- LOCKED OUT (Attempts: ${currentFailures}) ---`
    };
    db.securityAlerts.unshift(lockoutAlert);
    
    saveDatabase(db);
    return res.status(403).json({
      success: false,
      isLockedOut: true,
      messageEn: "Security limit reached! Access locked for 15 minutes. Notification alert recorded.",
      messageAr: "تم بلوغ الحد الأقصى للمحاولات! تم قفل الدخول لمدة 15 دقيقة. تم تسجيل تنبيه أمني."
    });
  }

  saveDatabase(db);
  const attemptsRemaining = 5 - currentFailures;
  return res.status(401).json({
    success: false,
    messageEn: `Invalid credentials. Attempt ${currentFailures} of 5.`,
    messageAr: `بيانات الدخول غير صحيحة. المحاولة ${currentFailures} من 5.`,
    attemptsRemaining
  });
});

// Get security alerts (Admin Only)
app.get("/api/admin/security/alerts", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }
  res.json({
    alerts: db.securityAlerts || [],
    failedAttemptsCount: db.failedAttemptsCount || 0,
    lockoutUntil: db.lockoutUntil || 0
  });
});

// Resolve security alert (Admin Only)
app.post("/api/admin/security/resolve", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  const { alertId } = req.body;
  if (db.securityAlerts) {
    db.securityAlerts = db.securityAlerts.map(alert => {
      if (alert.id === alertId) {
        return { ...alert, resolved: true };
      }
      return alert;
    });
    saveDatabase(db);
  }
  res.json({ success: true, alerts: db.securityAlerts || [] });
});

// Clear all security alerts (Admin Only)
app.post("/api/admin/security/clear-all", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  db.securityAlerts = [];
  db.failedAttemptsCount = 0;
  db.lockoutUntil = 0;
  saveDatabase(db);
  res.json({ success: true, message: "Security log cleared successfully" });
});

// 2. Get all books (omit pdfFile in general listing to optimize load speed)
app.get("/api/books", (req, res) => {
  const booksSummary = db.books.map(({ pdfFile, ...rest }) => ({
    ...rest,
    hasPdf: !!pdfFile
  }));
  res.json(booksSummary);
});

// 3. Get single book (includes cover, metadata, but still omits heavy pdfFile to keep it lightweight)
app.get("/api/books/:id", (req, res) => {
  const book = db.books.find((b) => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ error: "Book not found / الكتاب غير موجود" });
  }
  const { pdfFile, ...rest } = book;
  res.json({ ...rest, hasPdf: !!pdfFile });
});

// 4. Create new book (Admin authorized via simple header check for token)
app.post("/api/books", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  const newBook: Book = req.body;
  if (!newBook.titleEn || !newBook.titleAr) {
    return res.status(400).json({ error: "Titles are required / العناوين مطلوبة" });
  }

  // Assign stable id
  const slug = newBook.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const bookId = slug + "-" + Date.now();
  newBook.id = bookId;
  newBook.createdAt = Date.now();
  newBook.downloadCount = newBook.downloadCount !== undefined ? Number(newBook.downloadCount) : 0;
  newBook.showDownloads = newBook.showDownloads !== undefined ? Boolean(newBook.showDownloads) : true;
  newBook.showRating = newBook.showRating !== undefined ? Boolean(newBook.showRating) : true;
  newBook.ratingValue = newBook.ratingValue !== undefined ? Number(newBook.ratingValue) : 5.0;
  newBook.ratingCount = newBook.ratingCount !== undefined ? Number(newBook.ratingCount) : 0;

  // Save the PDF file to disk if present to prevent memory bloat in db.json
  if (newBook.pdfFile && newBook.pdfFile.startsWith("data:")) {
    try {
      let base64Data = newBook.pdfFile;
      const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.*)$/);
      if (matches && matches.length === 3) {
        base64Data = matches[2];
      }
      const pdfBuffer = Buffer.from(base64Data, "base64");
      const filePath = path.join(UPLOADS_DIR, `${bookId}.pdf`);
      fs.writeFileSync(filePath, pdfBuffer);
      newBook.pdfFile = "stored_on_disk";
    } catch (err) {
      console.error("Error saving PDF file to disk:", err);
      return res.status(500).json({ error: "Failed to save PDF document on the server" });
    }
  }

  db.books.unshift(newBook);
  saveDatabase(db);

  res.status(201).json(newBook);
});

// 5. Update book (Admin)
app.put("/api/books/:id", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  const { id } = req.params;
  const bookIndex = db.books.findIndex((b) => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found / الكتاب غير موجود" });
  }

  const updatedFields = req.body;
  const originalBook = db.books[bookIndex];

  // Save the PDF file to disk if a new one is uploaded
  if (updatedFields.pdfFile && updatedFields.pdfFile.startsWith("data:")) {
    try {
      let base64Data = updatedFields.pdfFile;
      const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.*)$/);
      if (matches && matches.length === 3) {
        base64Data = matches[2];
      }
      const pdfBuffer = Buffer.from(base64Data, "base64");
      const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
      fs.writeFileSync(filePath, pdfBuffer);
      updatedFields.pdfFile = "stored_on_disk";
    } catch (err) {
      console.error("Error saving updated PDF file to disk:", err);
      return res.status(500).json({ error: "Failed to save PDF document on the server" });
    }
  }

  // Merge, ensuring we preserve the PDF file if not uploaded in this edit session
  db.books[bookIndex] = {
    ...originalBook,
    ...updatedFields,
    id: originalBook.id, // preserve ID
    createdAt: originalBook.createdAt, // preserve creation date
    downloadCount: updatedFields.downloadCount !== undefined ? Number(updatedFields.downloadCount) : originalBook.downloadCount,
    showDownloads: updatedFields.showDownloads !== undefined ? Boolean(updatedFields.showDownloads) : (originalBook.showDownloads !== undefined ? originalBook.showDownloads : true),
    showRating: updatedFields.showRating !== undefined ? Boolean(updatedFields.showRating) : (originalBook.showRating !== undefined ? originalBook.showRating : true),
    ratingValue: updatedFields.ratingValue !== undefined ? Number(updatedFields.ratingValue) : (originalBook.ratingValue !== undefined ? originalBook.ratingValue : 5.0),
    ratingCount: updatedFields.ratingCount !== undefined ? Number(updatedFields.ratingCount) : (originalBook.ratingCount !== undefined ? originalBook.ratingCount : 0)
  };

  saveDatabase(db);
  res.json(db.books[bookIndex]);
});

// 5.5. Chunked Upload endpoint (Admin)
// Allows uploading heavy files in small chunks to bypass the 32MB Cloud Run / reverse proxy size limit.
app.post("/api/books/:id/upload-chunk", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  const { id } = req.params;
  const bookIndex = db.books.findIndex((b) => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found / الكتاب غير موجود" });
  }

  const { chunkIndex, totalChunks, chunkData, fileName } = req.body;
  if (chunkIndex === undefined || totalChunks === undefined || !chunkData) {
    return res.status(400).json({ error: "Missing chunk parameters / معلمات جزء الملف مفقودة" });
  }

  try {
    let base64Data = chunkData;
    if (base64Data.startsWith("data:")) {
      const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.*)$/);
      if (matches && matches.length === 3) {
        base64Data = matches[2];
      }
    }
    const pdfBuffer = Buffer.from(base64Data, "base64");
    
    const tmpFilePath = path.join(UPLOADS_DIR, `${id}.pdf.tmp`);
    
    // If first chunk, delete any existing temp file to start fresh
    if (chunkIndex === 0) {
      if (fs.existsSync(tmpFilePath)) {
        fs.unlinkSync(tmpFilePath);
      }
    }
    
    fs.appendFileSync(tmpFilePath, pdfBuffer);
    
    // If last chunk, rename to the final PDF file
    if (chunkIndex === totalChunks - 1) {
      const finalFilePath = path.join(UPLOADS_DIR, `${id}.pdf`);
      if (fs.existsSync(finalFilePath)) {
        fs.unlinkSync(finalFilePath);
      }
      fs.renameSync(tmpFilePath, finalFilePath);
      
      // Update book database entry
      db.books[bookIndex].pdfFile = "stored_on_disk";
      db.books[bookIndex].pdfFileName = fileName || `${id}.pdf`;
      saveDatabase(db);
    }
    
    res.json({ success: true, chunkIndex });
  } catch (err) {
    console.error("Error writing chunk:", err);
    res.status(500).json({ error: "Failed to upload file chunk / فشل رفع جزء الملف" });
  }
});

// 6. Delete book (Admin)
app.delete("/api/books/:id", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  const { id } = req.params;
  const bookIndex = db.books.findIndex((b) => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found / الكتاب غير موجود" });
  }

  // Delete physical file if it exists
  const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Error deleting PDF file from disk:", err);
    }
  }

  db.books.splice(bookIndex, 1);
  saveDatabase(db);

  res.json({ success: true, message: "Book deleted / تم حذف الكتاب بنجاح" });
});

// 7. Strictly Direct PDF Download Route (CRITICAL TASK)
// Forces direct download of the PDF without any redirects or pop-ups.
app.get("/api/books/download/:id", (req, res) => {
  const { id } = req.params;
  const book = db.books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).send("Book not found / الكتاب غير موجود");
  }

  if (!book.pdfFile) {
    return res.status(404).send("PDF file is missing / ملف الـ PDF غير متوفر لهذا الكتاب");
  }

  try {
    // Increment download counter
    book.downloadCount = (book.downloadCount || 0) + 1;
    saveDatabase(db);

    // Create clean download filename
    const filename = book.pdfFileName || `${book.titleEn.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
    const asciiFallback = `${id}.pdf`;

    if (book.pdfFile === "stored_on_disk") {
      const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
      if (!fs.existsSync(filePath)) {
        return res.status(404).send("PDF file not found on disk / ملف الـ PDF غير متوفر على الخادم");
      }
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition", 
        `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`
      );
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.on("error", (err) => {
        console.error("Error streaming PDF from disk:", err);
        if (!res.headersSent) {
          res.status(500).send("Error streaming file download / حدث خطأ أثناء تحميل الملف");
        }
      });
      return fileStream.pipe(res);
    } else {
      // Extract raw base64 data (in case they uploaded standard base64 or Data URI scheme)
      let base64Data = book.pdfFile;
      if (base64Data.startsWith("data:")) {
        const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.*)$/);
        if (matches && matches.length === 3) {
          base64Data = matches[2];
        }
      }
      const pdfBuffer = Buffer.from(base64Data, "base64");
      
      // Force immediate download response headers safely
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition", 
        `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      
      return res.send(pdfBuffer);
    }
  } catch (error) {
    console.error("Download processing error:", error);
    return res.status(500).send("Error compiling file for download / حدث خطأ أثناء إعداد الملف للتحميل");
  }
});

// 8. Get Author Bio
app.get("/api/author", (req, res) => {
  res.json(db.author);
});

// 9. Update Author Bio (Admin)
app.post("/api/author", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  db.author = req.body;
  saveDatabase(db);
  res.json(db.author);
});

// 10. Get UI Texts
app.get("/api/uitexts", (req, res) => {
  res.json(db.uiTexts || defaultUiTexts);
});

// 11. Update UI Texts (Admin)
app.post("/api/uitexts", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  db.uiTexts = req.body;
  saveDatabase(db);
  res.json(db.uiTexts);
});

// 11.5. Increment site visitor counter
app.post("/api/visitor/increment", (req, res) => {
  if (db.uiTexts) {
    if (db.uiTexts.visitorCount === undefined) {
      db.uiTexts.visitorCount = 1428;
    }
    db.uiTexts.visitorCount += 1;
    saveDatabase(db);
  }
  res.json({ success: true, visitorCount: db.uiTexts?.visitorCount || 1428 });
});

// 11.6. Rate book endpoint
app.post("/api/books/rate/:id", (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (rating === undefined || typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
  }

  const bookIndex = db.books.findIndex((b) => b.id === id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  const book = db.books[bookIndex];
  const currentCount = book.ratingCount || 0;
  const currentVal = book.ratingValue || 5.0;
  const totalScore = currentVal * currentCount + rating;
  const newCount = currentCount + 1;
  
  book.ratingCount = newCount;
  book.ratingValue = Math.round((totalScore / newCount) * 10) / 10;

  saveDatabase(db);
  res.json({ success: true, ratingValue: book.ratingValue, ratingCount: book.ratingCount });
});

// 12. Update Admin Password (Admin)
app.post("/api/admin/password", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  const { newPassword } = req.body;
  if (!newPassword || newPassword.trim().length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long / يجب أن تتكون كلمة المرور من 8 أحرف على الأقل" });
  }

  const cleanPassword = newPassword.trim();
  // Enforce uppercase, lowercase, digit, and special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_\-\/])[A-Za-z\d@$!%*?&#_\-\/]{8,}$/;
  if (!passwordRegex.test(cleanPassword)) {
    return res.status(400).json({ 
      error: "Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&#_-/) / يجب أن تحتوي كلمة المرور على: حرف كبير واحد، وحرف صغير واحد، ورقم واحد، ورمز خاص واحد على الأقل" 
    });
  }

  db.adminPassword = cleanPassword;
  
  // Log password change event
  const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "Unknown Browser";
  const changeAlert: SecurityAlert = {
    id: "alert-password-change-" + Date.now(),
    timestamp: Date.now(),
    ipAddress,
    userAgent,
    type: "password_changed",
    resolved: false,
    attemptedPassword: "--- PASSWORD CHANGED SUCCESSFULLY ---"
  };
  
  if (!db.securityAlerts) db.securityAlerts = [];
  db.securityAlerts.unshift(changeAlert);

  saveDatabase(db);
  res.json({ success: true, message: "Password updated successfully / تم تحديث كلمة المرور بنجاح" });
});


// 13. Get all Posts
app.get("/api/posts", (req, res) => {
  const posts = db.posts || [];
  // Sort posts by newest first
  const sorted = [...posts].sort((a, b) => b.createdAt - a.createdAt);
  res.json(sorted);
});

// 14. Create a Post (Admin)
app.post("/api/posts", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  const { contentEn, contentAr, image, video, likes, views } = req.body;
  if (!contentEn && !contentAr) {
    return res.status(400).json({ error: "Post content is required / محتوى المنشور مطلوب" });
  }

  const newPost: Post = {
    id: "post-" + Date.now(),
    contentEn: contentEn || "",
    contentAr: contentAr || "",
    image: image || "",
    video: video || "",
    createdAt: Date.now(),
    likes: typeof likes === "number" ? likes : 0,
    views: typeof views === "number" ? views : 0,
    comments: []
  };

  if (!db.posts) db.posts = [];
  db.posts.push(newPost);
  saveDatabase(db);
  res.json(newPost);
});

// 15. Update a Post / Likes / Views count (Admin)
app.put("/api/posts/:id", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  const { id } = req.params;
  const { contentEn, contentAr, image, video, likes, views } = req.body;

  if (!db.posts) db.posts = [];
  const postIndex = db.posts.findIndex(p => p.id === id);
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found / المنشور غير موجود" });
  }

  const post = db.posts[postIndex];
  if (contentEn !== undefined) post.contentEn = contentEn;
  if (contentAr !== undefined) post.contentAr = contentAr;
  if (image !== undefined) post.image = image;
  if (video !== undefined) post.video = video;
  if (likes !== undefined && typeof likes === "number") post.likes = likes;
  if (views !== undefined && typeof views === "number") post.views = views;

  saveDatabase(db);
  res.json(post);
});

// 16. Delete a Post (Admin)
app.delete("/api/posts/:id", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  const { id } = req.params;
  if (!db.posts) db.posts = [];
  
  const postIndex = db.posts.findIndex(p => p.id === id);
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found / المنشور غير موجود" });
  }

  db.posts.splice(postIndex, 1);
  saveDatabase(db);
  res.json({ success: true });
});

// 17. Like a Post (Public Visitor)
app.post("/api/posts/:id/like", (req, res) => {
  const { id } = req.params;
  if (!db.posts) db.posts = [];

  const post = db.posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  post.likes = (post.likes || 0) + 1;
  saveDatabase(db);
  res.json({ success: true, likes: post.likes });
});

// 17.1. View/Watch a Video/Post (Public Visitor)
app.post("/api/posts/:id/view", (req, res) => {
  const { id } = req.params;
  if (!db.posts) db.posts = [];

  const post = db.posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  post.views = (post.views || 0) + 1;
  saveDatabase(db);
  res.json({ success: true, views: post.views });
});

// 17.5 Unlike a Post (Public Visitor)
app.post("/api/posts/:id/unlike", (req, res) => {
  const { id } = req.params;
  if (!db.posts) db.posts = [];

  const post = db.posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  post.likes = Math.max(0, (post.likes || 0) - 1);
  saveDatabase(db);
  res.json({ success: true, likes: post.likes });
});

// 18. Comment on a Post (Public Visitor)
app.post("/api/posts/:id/comment", (req, res) => {
  const { id } = req.params;
  const { authorName, content } = req.body;

  if (!authorName || !content) {
    return res.status(400).json({ error: "Name and comment content are required" });
  }

  if (!db.posts) db.posts = [];
  const post = db.posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const newComment: PostComment = {
    id: "comment-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    authorName: authorName.trim(),
    content: content.trim(),
    createdAt: Date.now(),
    replies: []
  };

  if (!post.comments) post.comments = [];
  post.comments.push(newComment);
  saveDatabase(db);
  res.json({ success: true, comment: newComment });
});

// 19. Delete a Post Comment or Reply (Admin Only)
app.delete("/api/posts/:postId/comments/:commentId", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  const { postId, commentId } = req.params;
  if (!db.posts) db.posts = [];
  const post = db.posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  if (!post.comments) post.comments = [];

  // Check if primary comment
  const idx = post.comments.findIndex(c => c.id === commentId);
  if (idx !== -1) {
    post.comments.splice(idx, 1);
    saveDatabase(db);
    return res.json({ success: true });
  }

  // Check if it's a nested reply
  let found = false;
  for (const comment of post.comments) {
    if (comment.replies) {
      const rIdx = comment.replies.findIndex(r => r.id === commentId);
      if (rIdx !== -1) {
        comment.replies.splice(rIdx, 1);
        found = true;
        break;
      }
    }
  }

  if (found) {
    saveDatabase(db);
    return res.json({ success: true });
  }

  res.status(404).json({ error: "Comment not found" });
});

// 20. Reply to a Post Comment (Visitor or Admin)
app.post("/api/posts/:postId/comments/:commentId/reply", (req, res) => {
  const { postId, commentId } = req.params;
  const { authorName, content } = req.body;
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader === "Bearer coma_secure_token_2026";

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  if (!authorName && !isAdmin) {
    return res.status(400).json({ error: "Author name is required" });
  }

  if (!db.posts) db.posts = [];
  const post = db.posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  if (!post.comments) post.comments = [];
  const parentComment = post.comments.find(c => c.id === commentId);
  if (!parentComment) {
    return res.status(404).json({ error: "Parent comment not found" });
  }

  const name = isAdmin
    ? (authorName && authorName.trim() ? authorName.trim() : (db.author?.nameAr || "الكاتب / Site Owner"))
    : authorName.trim();

  const newReply: PostComment = {
    id: "comment-reply-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    authorName: name,
    content: content.trim(),
    createdAt: Date.now(),
    isAdminReply: isAdmin,
    replies: []
  };

  if (!parentComment.replies) parentComment.replies = [];
  parentComment.replies.push(newReply);
  saveDatabase(db);
  res.json({ success: true, reply: newReply });
});

// 21. Get All Interaction Schedules (Admin)
app.get("/api/admin/interaction-schedules", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }
  res.json(db.interactionSchedules || []);
});

// 22. Create New Interaction Schedule (Admin)
app.post("/api/admin/interaction-schedules", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  const { postId, targetViewsToAdd, targetLikesToAdd, durationMinutes } = req.body;

  if (!postId) {
    return res.status(400).json({ error: "postId is required" });
  }
  if (!db.posts) db.posts = [];
  const post = db.posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const mins = Math.max(1, parseInt(durationMinutes) || 1);
  const views = Math.max(0, parseInt(targetViewsToAdd) || 0);
  const likes = Math.max(0, parseInt(targetLikesToAdd) || 0);

  if (views === 0 && likes === 0) {
    return res.status(400).json({ error: "Please specify views or likes to add" });
  }

  const newSchedule: InteractionSchedule = {
    id: "schedule-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    postId,
    targetViewsToAdd: views,
    targetLikesToAdd: likes,
    addedViews: 0,
    addedLikes: 0,
    durationMinutes: mins,
    startedAt: Date.now(),
    lastUpdateAt: Date.now(),
    completed: false
  };

  if (!db.interactionSchedules) db.interactionSchedules = [];
  db.interactionSchedules.push(newSchedule);
  saveDatabase(db);

  res.json({ success: true, schedule: newSchedule });
});

// 23. Delete/Cancel Interaction Schedule (Admin)
app.delete("/api/admin/interaction-schedules/:id", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer coma_secure_token_2026") {
    return res.status(401).json({ error: "Unauthorized / غير مصرح لك" });
  }

  const { id } = req.params;
  if (!db.interactionSchedules) db.interactionSchedules = [];

  const index = db.interactionSchedules.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Schedule not found" });
  }

  db.interactionSchedules.splice(index, 1);
  saveDatabase(db);
  res.json({ success: true });
});




// ----------------------
// VITE DEV SERVER / PROD HANDLER
// ----------------------
async function startServer() {
  // Sync in-memory database with Firestore persistent storage on startup
  try {
    await syncWithFirestore();
  } catch (err) {
    console.error("Failed to sync database with Firestore on boot:", err);
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
