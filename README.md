# VolunteerHub - Volunteer Management System

VolunteerHub is a modern, full-stack NGO volunteer platform built for **NayePankh Foundation** to streamline volunteer onboarding, profile matching, event registration, and digital credentialing.

## Features Built

### 1. Account Onboarding & Authentication
* **Sign Up / Registration**: Secure registration form for new volunteers.
* **Authentication**: Password hashing with `bcryptjs` and session management via `NextAuth.js`.
* **Account Status**: New volunteer profiles start as pending until review.

### 2. Volunteer Profile Management
* Update personal details, contact details, profile picture, and education.
* Add specific skills (e.g., Teaching, First Aid, Event Planning) and interests.
* Track total accumulated volunteer hours directly on the profile.

### 3. Event Browser & AI Matching Recommendations
* Browse and search open NGO events.
* **AI Match Score**: Calculate dynamic compatibility scores (e.g., 85% match) based on the alignment of the volunteer's skills, interests, and past event history with event requirements.
* View event details, requirements, dates, and locations.

### 4. Application Tracking
* Submit applications for volunteer events.
* Track the status of each application (Pending, Approved, or Rejected) on a real-time status board.

### 5. Achievement Certificates & Public Verification
* Download beautifully formatted PDF certificates for completed events.
* Certificates include verification QR codes.
* **Public Verification**: A dedicated `/verify/[code]` route allows third parties to scan the certificate's QR code and instantly verify its authenticity.

---

## Technical Stack

* **Framework**: Next.js 15 (App Router)
* **Language**: TypeScript
* **Database**: Neon PostgreSQL
* **Styling**: Tailwind CSS & Shadcn UI
* **Forms & Validation**: React Hook Form & Zod
* **Authentication**: NextAuth.js (Auth.js)

---

## Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Jaswanth-Reddy-2006/NayePankh-Foundation.git
   cd NayePankh-Foundation
   ```

2. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_2UVoaikZhBI5@ep-holy-mode-attf70lr-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=secret_token_session_hash_volunteer_hub_2026_nxt
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Initialize & Seed the Database**:
   Start the development server:
   ```bash
   npm run dev
   ```
   Navigate to the database seeding endpoint in your browser to build the Postgres tables and insert initial mock data:
   `http://localhost:3000/api/seed`

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to access the platform.
