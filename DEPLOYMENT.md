# 🚀 AI Political Poster Maker — Deployment Guide (ডিপ্লয়মেন্ট নির্দেশিকা)

এই নির্দেশিকায় **AI Political Poster Maker (বাংলাদেশ)** প্রজেক্টটি লাইভ প্রোডাকশনে ডিপ্লয় করার সবচেয়ে সহজ এবং কার্যকর পদ্ধতিগুলো বিস্তারিত বর্ণনা করা হয়েছে।

---

## 🏗️ আর্কিটেকচার ওভারভিউ

* **Frontend:** Next.js (React 18, TailwindCSS, HTML5 Canvas High-Res Rendering)
* **Backend:** Node.js, Express, TypeScript, Sharp (Server-side Poster Composer), Google Gemini AI
* **Database:** MongoDB (MongoDB Atlas M0 Free Cluster অথবা Self-hosted Mongo)
* **File/Asset Storage:** Cloudinary, AWS S3, DigitalOcean Spaces অথবা Local Disk

---

## 🌟 পদ্ধতি ১: Vercel (Frontend) + Render / Railway (Backend) [সর্বোত্তম ও বিনামূল্যে]

এটি সবচেয়ে জনপ্রিয় ও নির্ভরযোগ্য সেটআপ, যেখানে ফ্রন্টএন্ড এবং ব্যাকএন্ড উভয়ই বিনামূল্যে (Free Tier) চালু রাখা সম্ভব।

### ধাপ ১: MongoDB Atlas ডাটাবেজ তৈরি করুন
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)-এ ফ্রি অ্যাকাউন্ট খুলুন বা লগইন করুন।
2. একটি ফ্রি **M0 Cluster** তৈরি করুন (Region: Singapore বা Asia-South সুপারিশকৃত)।
3. **Database Access**-এ গিয়ে একটি ইউজার তৈরি করুন (যেমন: `posteradmin`) এবং পাসওয়ার্ড সেট করুন।
4. **Network Access**-এ গিয়ে `0.0.0.0/0` (Allow Access from Anywhere) আইপি যোগ করুন।
5. **Connect** -> **Connect your application** নির্বাচন করে Connection String কপি করুন:
   ```text
   mongodb+srv://posteradmin:<PASSWORD>@cluster0.xxxxx.mongodb.net/political-poster-db?retryWrites=true&w=majority
   ```

---

### ধাপ ২: ব্যাকএন্ড ডিপ্লয় করুন (Render.com)
1. [Render.com](https://render.com)-এ লগইন করুন এবং **New +** -> **Web Service** চাপুন।
2. আপনার GitHub রিপোজিটরি নির্বাচন করুন।
3. নিচের সেটিংসগুলো পূরণ করুন:
   * **Name:** `ai-poster-backend`
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm start`
   * **Plan:** `Free`
4. **Environment Variables** সেকশনে নিচের ভেরিয়েবলগুলো যোগ করুন:
   * `NODE_ENV` = `production`
   * `PORT` = `5000`
   * `MONGODB_URI` = *(ধাপ ১-এ প্রাপ্ত আপনার MongoDB Atlas URI)*
   * `JWT_SECRET` = `your_strong_random_secret_key_bangladesh_2026`
   * `GEMINI_API_KEY` = *(আপনার Google AI Studio Gemini API Key)*
   * *(ঐচ্ছিক)* `CLOUDINARY_URL` = `cloudinary://api_key:api_secret@cloud_name`
5. **Create Web Service** বাটনে ক্লিক করুন। 
6. ডিপ্লয় সম্পন্ন হলে আপনার ব্যাকএন্ড URL পাবে (যেমন: `https://ai-poster-backend.onrender.com`)। 
   * টেস্ট করতে ব্রাউজারে `https://ai-poster-backend.onrender.com/api/health` ওপেন করুন। `{"status":"online"}` দেখতে পাবেন এবং টেমপ্লেট ডাটাবেজে স্বয়ংক্রিয়ভাবে সিড (auto-seed) হয়ে যাবে!

---

### ধাপ ৩: ফ্রন্টএন্ড ডিপ্লয় করুন (Vercel)
1. [Vercel.com](https://vercel.com)-এ লগইন করে **Add New...** -> **Project** নির্বাচন করুন।
2. আপনার GitHub রিপোজিটরি ইমপোর্ট করুন।
3. কনফিগারেশনে:
   * **Root Directory:** `frontend` নির্বাচন করুন।
   * **Framework Preset:** `Next.js` (স্বয়ংক্রিয়ভাবে সিলেক্ট হবে)।
4. **Environment Variables**-এ যোগ করুন:
   * `NEXT_PUBLIC_API_URL` = `https://ai-poster-backend.onrender.com/api`
   *(আপনার ব্যাকএন্ড URL এর শেষে `/api` নিশ্চিত করুন)*
5. **Deploy** বাটনে ক্লিক করুন!
6. কয়েক সেকেন্ডের মধ্যে আপনার লাইভ সাইট তৈরি হয়ে যাবে (যেমন: `https://ai-poster-maker.vercel.app`)।

---

## 🐳 পদ্ধতি ২: Docker Compose দিয়ে VPS বা ক্লাউডে ডিপ্লয় (DigitalOcean / Ubuntu / AWS)

যদি আপনার নিজস্ব কোনো VPS বা ডেডিকেটেড সার্ভার থাকে, তবে ডকার ব্যবহার করে এক কমান্ডে সম্পূর্ণ স্ট্যাক চালানো যায়।

### ধাপসমূহ:
1. সার্ভারে রিপোজিটরি ক্লোন করুন:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```
2. `.env` ফাইলে আপনার `GEMINI_API_KEY` এবং অন্যান্য কনফিগ লিখুন:
   ```bash
   export GEMINI_API_KEY="AIzaSy..."
   ```
3. ডকার কন্টেইনার বিল্ড এবং রান করুন:
   ```bash
   docker compose up -d --build
   ```
4. সার্ভিসগুলো স্বয়ংক্রিয়ভাবে চালু হবে:
   * Frontend: `http://localhost:3000` (অথবা আপনার সার্ভারের পাবলিক আইপি)
   * Backend: `http://localhost:5000`
   * MongoDB: `localhost:27017`
5. ডোমেইন ও SSL যোগ করার জন্য Nginx Reverse Proxy ও Certbot সেটআপ করে নিন:
   ```nginx
   # Nginx Frontend Reverse Proxy
   server {
       server_name poster.yourdomain.com;
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }

   # Nginx Backend API Reverse Proxy
   server {
       server_name api.yourdomain.com;
       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           client_max_body_size 50M;
       }
   }
   ```

---

## ⚙️ প্রোডাকশন পরিবেশের গুরুত্বপূর্ণ এনভায়রনমেন্ট ভেরিয়েবল (Environment Variables Checklist)

### Backend (`backend/.env`):
| ভেরিয়েবল | বর্ণনা | উদাহরণ |
| :--- | :--- | :--- |
| `PORT` | ব্যাকএন্ড এক্সপ্রেস পোর্ট | `5000` |
| `NODE_ENV` | প্রোডাকশন মোড | `production` |
| `MONGODB_URI` | মঙ্গোডিবি সংযোগ স্ট্রিং | `mongodb+srv://...` |
| `JWT_SECRET` | ইউজার অথেন্টিকেশন সাইনিং কী | `super_secret_key_...` |
| `GEMINI_API_KEY` | জেমিনি এআই এপিআই কি | `AIzaSy...` |
| `CLOUDINARY_URL` *(ঐচ্ছিক)* | ক্লাউডিনারি ক্লাউড স্টোরেজ | `cloudinary://...` |
| `S3_BUCKET` *(ঐচ্ছিক)* | AWS S3 / DigitalOcean Spaces বাকেট | `my-poster-bucket` |

### Frontend (`frontend/.env.local` বা Vercel Env):
| ভেরিয়েবল | বর্ণনা | উদাহরণ |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | প্রোডাকশন ব্যাকএন্ড এপিআই রুট | `https://ai-poster-backend.onrender.com/api` |

---

## ✅ ডিপ্লয়মেন্ট পরবর্তী যাচাইকরণ তালিকা (Post-Deployment Verification Checklist)

1. [ ] **স্বাস্থ্য পরীক্ষা (Health Check):** `GET /api/health` কল করে রেসপন্স `{"status":"online"}` আসছে কি না।
2. [ ] **টেমপ্লেট তালিকা:** হোমপেজ এবং `/templates` পেজে সকল রাজনৈতিক টেমপ্লেট লোড হচ্ছে কি না।
3. [ ] **এআই স্লোগান জেনারেশন:** `/create` পেজে `✨ এআই স্লোগান জেনারেট করুন` বাটনে চাপ দিলে জেমিনি এআই নতুন স্লোগান প্রস্তাব করছে কি না।
4. [ ] **ছবি আপলোড ও পোস্টার রেন্ডার:** ছবি আপলোড করে হাই-রেজ্যুলেশন পোস্টার সফলভাবে প্রিভিউ এবং ডাউনলোড (PNG ও PDF) হচ্ছে কি না।
5. [ ] **বাল্ক জেনারেশন (Bulk):** `/bulk` পেজে CSV আপলোড করে এক ক্লিকে ব্যাচ পোস্টার তৈরি হচ্ছে কি না।
