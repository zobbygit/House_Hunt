
<div align="center">
<img width="1342" height="946" alt="image" src="https://github.com/user-attachments/assets/545bf332-56bf-4f6b-89e2-8f0ace600c2c" />


# 🏠 House Hunt

### A full-stack rental property marketplace — built with the MERN stack

**Find your perfect place. List it. Book it. Chat about it. All in one app.**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)
![Open Source](https://img.shields.io/badge/Open%20Source-❤-red?style=flat-square)

</div>

---

## 📖 Table of Contents

- [✨ Overview](#-overview)
- [🎯 Features](#-features)
  - [🏘️ For Tenants](#️-for-tenants)
  - [🗝️ For Owners](#️-for-owners)
  - [🌍 Platform-Wide](#-platform-wide)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🔌 API Overview](#-api-overview)
- [🚀 Getting Started](#-getting-started)
- [🔑 Environment Variables](#-environment-variables)
- [🌐 Deployment](#-deployment)
- [🎨 Design Philosophy](#-design-philosophy)
- [📄 License](#-license)

---

## ✨ Overview

**House Hunt** connects two kinds of people: **property owners** looking to list rentals or sales, and **tenants** hunting for their next home. It's not just a listings board — it's a complete workflow: search → save → request → negotiate → decide, all wrapped in a custom-built, cohesive design system rather than a generic template.

Every interaction — booking a viewing, messaging an owner, saving a favorite — updates live with toast notifications, so nobody's left wondering if their action actually went through.

---

## 🎯 Features

### 🏘️ For Tenants

| | |
|---|---|
| 🔍 **Smart Search** | Filter by keyword, property type, Rent vs. Sale, and price range — all combinable |
| 🖼️ **Rich Property Pages** | Full-screen photo gallery with swipe & arrow navigation, thumbnail strip, amenities, and a one-tap **Call Owner** button |
| 📩 **Booking Requests** | Send a request with a personal message; withdraw it anytime while it's still pending |
| 💬 **In-App Messaging** | A reply thread lives on every booking — negotiate details without ever swapping phone numbers upfront |
| 🔔 **Live Notifications** | Toasts fire the instant an owner accepts or declines your request — no refreshing required |
| ❤️ **Wishlist** | Heart any listing to save it; manage everything from a dedicated **Saved Properties** page |
| 👤 **Profile Control** | Update your name, phone number, and profile photo from a popup accessible on every page |

### 🗝️ For Owners

| | |
|---|---|
| 🏢 **Full Listing Management** | Create, edit, and delete properties — type, Rent/Sale, address, price, bedrooms, bathrooms, furnishing, and parking |
| 📸 **Photo Uploads** | Up to 3 images per listing via Cloudinary, with live previews before you even hit submit |
| 🔄 **Availability Toggle** | Mark a property **Rented/Sold** to instantly hide it from tenant search — no need to delete it |
| 📥 **Booking Inbox** | Accept or reject requests, and reply to tenants directly inside each booking thread |
| 📊 **Analytics Dashboard** | At-a-glance stat cards: **Property Views**, **Favorites**, **Already Booked** (with tenant names!), **Pending Approvals**, and a **For Sale / For Rent** breakdown |
| 🔴 **Nav Badge** | See your pending-booking count at a glance, no need to open the page |

### 🌍 Platform-Wide

- 🔐 **JWT authentication** with strict role-based access (owner vs. tenant) enforced on both frontend routes *and* backend endpoints
- ⚡ **Live-feeling updates** via smart polling — bookings, messages, and status changes all sync without a manual refresh
- 📱 **Fully responsive** — every single component, from property cards to the profile popup, is built mobile-first and scales up cleanly
- 🎨 **A real design system, not a template** — a cohesive "property tour" visual language (dashed route lines, keychain-tag property cards, perforated booking tickets) ties every page together into one coherent product

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Frontend**
- ⚛️ React 19
- 🧭 React Router (client-side routing)
- 🎨 Hand-built CSS design system (no UI framework)

</td>
<td valign="top" width="50%">

**Backend**
- 🟢 Node.js + Express
- 🍃 MongoDB + Mongoose
- 🔑 JWT + bcrypt for auth
- ☁️ Cloudinary + Multer for image uploads

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────┐        HTTPS/JSON        ┌──────────────────┐
│                  │ ───────────────────────► │                  │
│  React Frontend  │                            │  Express Backend │
│    (Vercel)      │ ◄─────────────────────── │    (Render)       │
│                  │                            │                  │
└─────────────────┘                            └────────┬─────────┘
                                                          │
                                          ┌───────────────┼───────────────┐
                                          │               │               │
                                    ┌─────▼─────┐  ┌──────▼─────┐  ┌─────▼──────┐
                                    │  MongoDB   │  │ Cloudinary │  │    JWT     │
                                    │  (Atlas)   │  │  (images)  │  │   (auth)   │
                                    └────────────┘  └────────────┘  └────────────┘
```

---

## 📁 Project Structure


<h2 align="center">🏠 House Hunt — Project Structure</h2>

<details>
<summary><b>📂 Click to view project structure</b></summary>

<br>

<pre>
house_hunt/
│
├── 📁 backend/
│   ├── 📁 config/
│   │   ├── 📄 cloudinary.js
│   │   └── 📄 config.js
│   │
│   ├── 📁 controllers/
│   │   ├── 📄 authController.js
│   │   ├── 📄 bookingController.js
│   │   ├── 📄 favoriteController.js
│   │   └── 📄 propertyController.js
│   │
│   ├── 📁 middleware/
│   │   ├── 📄 authMiddleware.js
│   │   ├── 📄 optionalAuthMiddleware.js
│   │   ├── 📄 roleMiddleware.js
│   │   └── 📄 uploadMiddleware.js
│   │
│   ├── 📁 routes/
│   │   ├── 📄 authRoutes.js
│   │   ├── 📄 bookingRoutes.js
│   │   ├── 📄 favoriteRoutes.js
│   │   └── 📄 propertyRoutes.js
│   │
│   ├── 📁 schemas/
│   │   ├── 📄 booking.js
│   │   ├── 📄 favorite.js
│   │   ├── 📄 property.js
│   │   └── 📄 user.js
│   │
│   ├── 📁 scripts/
│   │   ├── 📄 assignOrphanProperties.js
│   │   ├── 📄 assignOwnerToProperties.js
│   │   └── 📄 backfillOwners.js
│   │
│   ├── 📁 test1/
│   │   ├── 🖼️ test.jpg
│   │   └── 📄 testCloudinary.js
│   │
│   ├── ⚙️ .gitignore
│   ├── 📄 index.js
│   ├── ⚙️ package-lock.json
│   └── ⚙️ package.json
│
├── 📁 frontend/
│   ├── 📁 public/
│   │   ├── 🌐 index.html
│   │   └── 🖼️ rent.svg
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📄 Footer.jsx
│   │   │   ├── 📄 LoginHeader.jsx
│   │   │   ├── 📄 PrivateRoute.jsx
│   │   │   ├── 📄 ProfilePopup.jsx
│   │   │   ├── 📄 PropertyCard.jsx
│   │   │   └── 📄 PropertyMiniGallery.jsx
│   │   │
│   │   ├── 📁 config/
│   │   │   └── 📄 api.js
│   │   │
│   │   ├── 📁 features/
│   │   │   ├── 📁 auth/
│   │   │   │   ├── 📄 Login.jsx
│   │   │   │   └── 📄 Register.jsx
│   │   │   │
│   │   │   ├── 📁 bookings/
│   │   │   │   ├── 📄 OwnerBookings.jsx
│   │   │   │   └── 📄 TenantBookings.jsx
│   │   │   │
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── 📄 Dashboard.jsx
│   │   │   │
│   │   │   ├── 📁 home/
│   │   │   │   └── 📄 Home.jsx
│   │   │   │
│   │   │   └── 📁 listings/
│   │   │       ├── 📄 OwnerListings.jsx
│   │   │       ├── 📄 PropertyDetails.jsx
│   │   │       ├── 📄 SavedProperties.jsx
│   │   │       └── 📄 TenantListings.jsx
│   │   │
│   │   ├── 📁 styles/
│   │   │   ├── 🎨 auth.css
│   │   │   ├── 🎨 global.css
│   │   │   └── 🎨 header.css
│   │   │
│   │   ├── 📄 App.js
│   │   └── 📄 index.js
│   │
│   ├── ⚙️ .gitignore
│   ├── 📝 README.md
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   └── ⚙️ vercel.json
│
├── ⚙️ .gitignore
├── ⚙️ .hintrc
└── 📝 README.md
</pre>

</details>
```

---

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account (owner or tenant) |
| `POST` | `/api/auth/login` | Log in, receive a JWT |
| `GET` | `/api/auth/me` | Get the current logged-in user's profile |
| `PUT` | `/api/auth/profile` | Update name, phone, or avatar |
| `GET` | `/api/properties` | Public search with filters (q, type, adType, price range) |
| `GET` | `/api/properties/:id` | Get a single property's full details |
| `POST` | `/api/properties` | Create a listing *(owner only)* |
| `PUT` | `/api/properties/:id` | Edit a listing *(owner only)* |
| `DELETE` | `/api/properties/:id` | Delete a listing *(owner only)* |
| `GET` | `/api/properties/mine` | Get the logged-in owner's listings |
| `GET` | `/api/properties/analytics/owner` | Owner analytics summary |
| `POST` | `/api/bookings` | Send a booking request *(tenant only)* |
| `GET` | `/api/bookings/mine` | Get the tenant's own bookings |
| `GET` | `/api/bookings/owner` | Get bookings for the owner's properties |
| `PUT` | `/api/bookings/:id` | Accept or reject a booking *(owner only)* |
| `DELETE` | `/api/bookings/:id` | Cancel a pending booking *(tenant only)* |
| `POST` | `/api/bookings/:id/messages` | Send a message on a booking thread |
| `DELETE` | `/api/bookings/:id/messages/:messageId` | Delete your own message |
| `POST` | `/api/favorites/:propertyId` | Toggle save/unsave on a property |
| `GET` | `/api/favorites/mine` | Get the tenant's saved properties |

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/zobbygit/House_Hunt.git
cd House_Hunt
```

### 2️⃣ Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:3000
```

Start it:

```bash
npm start
```

➡️ API running at `http://localhost:5000`

### 3️⃣ Frontend setup

Open a **new terminal**:

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start it:

```bash
npm start
```

➡️ App running at `http://localhost:3000`

---

## 🔑 Environment Variables

| Variable | Where | Description |
|---|---|---|
| `PORT` | backend | Port the Express server listens on *(defaults to 5000)* |
| `MONGODB_URI` | backend | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | backend | Secret used to sign & verify auth tokens |
| `CLOUDINARY_CLOUD_NAME` | backend | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | backend | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | backend | Cloudinary API secret |
| `FRONTEND_URL` | backend | Allowed CORS origin(s) — your live frontend URL in production |
| `REACT_APP_API_URL` | frontend | Base URL the frontend uses to reach the backend API |

---

## 🌐 Deployment

This project ships as a two-part deployment:

| | Service | Root Directory | Notes |
|---|---|---|---|
| 🎨 Frontend | [Vercel](https://vercel.com) | `frontend` | Framework auto-detected (CRA). Add `REACT_APP_API_URL` env var. |
| ⚙️ Backend | [Render](https://render.com) | `backend` | Build: `npm install` · Start: `npm start`. Add all backend env vars. |

**After both are live:**
1. Copy your Render backend URL → set it as `REACT_APP_API_URL` on Vercel
2. Copy your Vercel frontend URL → set it as `FRONTEND_URL` on Render → redeploy backend
3. If using MongoDB Atlas, allow network access from `0.0.0.0/0` so Render can connect

---

## 🎨 Design Philosophy

House Hunt isn't styled with a component library — every visual element follows one intentional metaphor: **a guided property tour.**

- 🗝️ A **key icon** greets you on the dashboard, with a dashed **route line** connecting each section like stops on a tour
- 🏷️ Property cards are styled as **keychain tags** — punched hole, colored ribbon for Rent/Sale, price tinted to match
- 🎫 Booking cards are **perforated tickets** — a torn-stub divider separates the request from its status
- 🟢 🔵 Consistent **color coding** throughout: forest green for owners, teal for tenants

---

## 📄 License

This project is open source and available under the **[MIT License](https://opensource.org/licenses/MIT)**.

Feel free to fork it, learn from it, or build on top of it.

---

<div align="center">

### Made with ❤️ by **Zohaib**

*If this project helped you, consider giving it a ⭐ on GitHub!*

</div>
