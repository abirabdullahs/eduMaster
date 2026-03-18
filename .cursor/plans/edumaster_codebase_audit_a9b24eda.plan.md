---
name: EduMaster Codebase Audit
overview: Comprehensive audit of the EduMaster Next.js 14 EdTech platform against a detailed feature checklist, including auth, dashboards, course content, exams, and technical aspects. Report identifies completed, partial, and missing features plus top-priority fixes.
todos: []
isProject: false
---

# EduMaster Codebase Audit Report

## Summary

The codebase is well-structured with Next.js 15, Supabase, Tailwind v4, and shadcn-style components. Most core features are implemented, but several gaps exist around certificates, exam attempt limits, notifications targeting, public exam navigation, and some schema inconsistencies.

---

## AUTH SYSTEM


| Feature                                                       | Status   | Notes                                                                                                                    |
| ------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| Student signup (name, class SSC/HSC, mobile, email, password) | Complete | [app/(auth)/signup/page.tsx](app/(auth)/signup/page.tsx) – all fields, Zod validation                                    |
| Teacher signup (pending status, admin approval)               | Complete | [app/(auth)/teacher-signup/page.tsx](app/(auth)/teacher-signup/page.tsx) – status: pending, user signed out after submit |
| Login with role-based redirect                                | Complete | [app/(auth)/login/page.tsx](app/(auth)/login/page.tsx) – admin/teacher/student redirect                                  |
| Middleware route protection                                   | Complete | [middleware.ts](middleware.ts) – protects /admin, /teacher, /student                                                     |
| Pending teacher blocked from dashboard                        | Complete | Middleware signs out if status !== 'active' (lines 83–86)                                                                |


---

## ADMIN DASHBOARD


| Feature                                    | Status   | Notes                                                                                                                                                              |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| View toggle (simulate teacher/student)     | Complete | ViewToggle + AdminViewContext                                                                                                                                      |
| Teacher requests (approve/reject)          | Complete | [admin/teachers/page.tsx](app/(dashboard)/admin/teachers/page.tsx)                                                                                                 |
| Teacher list with assigned courses         | Partial  | Teacher list exists; courses per teacher not shown                                                                                                                 |
| Student list with search/filter            | Complete | Search by name/email, filter by SSC/HSC                                                                                                                            |
| Per-student detail (enrollments, results)  | Partial  | Enrollments real; results use placeholder data                                                                                                                     |
| Course CRUD                                | Complete | Create, edit, delete, publish/draft                                                                                                                                |
| Course hierarchy (Subject→Chapter→Lecture) | Complete | ContentTree + CourseContentForms                                                                                                                                   |
| Enrollment management                      | Complete | Pending/Active/Offline tabs, approve/reject                                                                                                                        |
| Offline course enrollment approval         | Complete | Offline tab in enrollments                                                                                                                                         |
| Monthly payment requests (approve/reject)  | Partial  | UI only; no real data or approve/reject logic                                                                                                                      |
| Notifications (all/course/specific)        | Partial  | Targets: all, students, teachers, specific. No course-scoped. Insert uses target/target_user_id; notifications likely need user_id per recipient (schema mismatch) |
| Events management                          | Partial  | Create, list, delete; Edit button present but no edit modal/logic                                                                                                  |


---

## COURSE CONTENT


| Feature                               | Status   | Notes                                                                                              |
| ------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| ContentTree (Subject→Chapter→Lecture) | Complete | [ContentTree.tsx](components/courses/ContentTree.tsx) recursive with @dnd-kit                      |
| Drag to reorder (order_index)         | Complete | handleDragEnd updates order_index                                                                  |
| Subject CRUD                          | Complete | SubjectForm in CourseContentForms                                                                  |
| Chapter CRUD with PDF link            | Complete | ChapterForm has pdf_url; DB column suggestion_pdf_url                                              |
| Lecture CRUD (HTML, video URL)        | Complete | LectureForm with ReactQuill + video_url                                                            |
| MCQ per lecture (image + KaTeX)       | Complete | [LectureQuestions.tsx](components/courses/LectureQuestions.tsx) – options with images, react-katex |


---

## TEACHER DASHBOARD


| Feature                              | Status   | Notes                                                                                                                             |
| ------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Assigned courses list                | Complete | Teacher courses by teacher_id                                                                                                     |
| Content management                   | Complete | Same ContentTree/CourseContentForms                                                                                               |
| Exam creation (all fields)           | Complete | [exams/new/page.tsx](app/(dashboard)/[role]/courses/[courseId]/exams/new/page.tsx) – duration, negative marking, time range, sets |
| Question management                  | Complete | QuestionForm with text, image, 4 options, KaTeX                                                                                   |
| Results view per exam                | Complete | [results/page.tsx](app/(dashboard)/[role]/courses/[courseId]/exams/[examId]/results/page.tsx) with CSV export                     |
| Send notification to course students | Missing  | Not implemented for teachers                                                                                                      |


---

## EXAM SYSTEM


| Feature                                                            | Status   | Notes                                                                                      |
| ------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------ |
| Exam creation (type, duration, negative marking, time range, sets) | Complete | Full form with all fields                                                                  |
| Auto unique access link                                            | Complete | access_link generated                                                                      |
| Set system (shuffle Q+options)                                     | Complete | [api/exam/generate-set](app/api/exam/generate-set/route.ts)                                |
| After end_time → Practice Mode                                     | Complete | ExamAccessClient shows PracticeMode when isAfterEnd                                        |
| ExamPlayer UI                                                      | Complete | Timer, navigator, KaTeX, images                                                            |
| Auto-submit on timer end                                           | Complete | ExamTimer onTimeUp → handleSubmit                                                          |
| Submit API with negative marking                                   | Complete | [api/exam/submit](app/api/exam/submit/route.ts)                                            |
| Practice Mode (timed/free)                                         | Complete | PracticeMode supports timed, untimed, custom                                               |
| Practice data NOT saved                                            | Partial  | Submit route saves all attempts including practice; spec says practice should not be saved |
| One attempt only for real exam                                     | Missing  | No check for existing real attempt before starting                                         |
| Results export CSV                                                 | Complete | Export button on results page                                                              |
| Submit uses exam_questions                                         | Partial  | Route queries exam_questions; types use questions; possible schema mismatch                |


---

## STUDENT DASHBOARD


| Feature                                        | Status   | Notes                                                                                                   |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| Home (progress, exams, notifications, results) | Complete | [student/page.tsx](app/(dashboard)/student/page.tsx)                                                    |
| My Courses + Explore tab                       | Complete | [student/courses/page.tsx](app/(dashboard)/student/courses/page.tsx)                                    |
| Enroll flow (paid + offline)                   | Complete | EnrollButton + PaymentModal (bKash/Nagad + transaction ID)                                              |
| Monthly payment due alert                      | Complete | MonthlyDueAlert component                                                                               |
| Monthly payment form (receipt number)          | Complete | Receipt input, status → pending                                                                         |
| Pending/paid/due badges                        | Complete | On offline courses                                                                                      |
| Course learning (ContentTree + lecture)        | Complete | [lecture/[lectureId]/page.tsx](app/(dashboard)/student/courses/[courseId]/lecture/[lectureId]/page.tsx) |
| Lecture (HTML, YouTube, complete, PDF)         | Complete | HTML render, video embed, mark complete, chapter PDF                                                    |
| Exams tab (course + public, badges)            | Complete | Status badges: Upcoming, Live, Ended                                                                    |
| Results history (exclude practice)             | Complete | .eq('is_practice', false)                                                                               |
| Events page                                    | Complete | List, search, upcoming/past                                                                             |
| Notifications page                             | Complete | Mark read, delete                                                                                       |
| Profile edit                                   | Complete | Name, mobile, class, password                                                                           |


---

## PUBLIC PAGES


| Feature                                                   | Status   | Notes                                                                                    |
| --------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| Home (hero, stats, featured, exams, testimonials, footer) | Complete | [app/(public)/page.tsx](app/(public)/page.tsx) + home components                         |
| Course catalog (search + filter)                          | Complete | CourseCatalogClient                                                                      |
| Course detail with EnrollButton                           | Complete | [courses/[courseId]/page.tsx](app/(public)/courses/[courseId]/page.tsx)                  |
| Exam access /exam/[accessLink]                            | Complete | Countdown, start, practice mode entry                                                    |
| UpcomingExams link                                        | Partial  | Links to `/exams/public/${exam.id}` but route is `/exams/public` only → 404              |
| Public exams “Take Exam” button                           | Partial  | [exams/public/page.tsx](app/(public)/exams/public/page.tsx) – button has no href/onClick |


---

## NOTIFICATIONS


| Feature                           | Status   | Notes                                                                             |
| --------------------------------- | -------- | --------------------------------------------------------------------------------- |
| Realtime bell icon + unread count | Complete | [NotificationBell.tsx](components/shared/NotificationBell.tsx) + useNotifications |
| Supabase Realtime subscription    | Complete | postgres_changes on notifications table                                           |


---

## CERTIFICATES


| Feature                                        | Status   | Notes                                                                                                                |
| ---------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| Auto-generate on course completion + exam pass | Missing  | API exists ([api/certificate/generate](app/api/certificate/generate/route.ts)) but no auto-trigger; nothing calls it |
| PDF download                                   | Complete | Certificates page links to certificate_url                                                                           |


---

## OTHER


| Feature                | Status   | Notes                                                                                           |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| KaTeX (inline + block) | Complete | LatexRenderer, react-markdown + remark-math/rehype-katex                                        |
| Tailwind CSS           | Complete | Tailwind v4, Poppins + Hind Siliguri, custom colors in [tailwind.config.ts](tailwind.config.ts) |
| RLS policies           | Unknown  | No migration/SQL in repo; schema managed elsewhere                                              |
| TypeScript types       | Complete | [lib/types.ts](lib/types.ts) covers main models                                                 |
| Loading skeletons      | Partial  | Skeletons.tsx exists; not used everywhere                                                       |
| Error handling + 404   | Complete | [error.tsx](app/error.tsx), [not-found.tsx](app/not-found.tsx)                                  |


---

## Technical Checks

### Broken Imports

- No broken imports found in sampled files. `@/` path alias works.

### Missing Components

- [CourseContentForms](components/courses/forms/CourseContentForms.tsx) exists at correct path.

### Supabase Error Handling

- Many Supabase calls use `if (error) throw` or `console.error`; some flows lack user-facing error handling.
- Certificate API uses `eq('exam_id.course_id', courseId)` – invalid Supabase syntax; join/filter must be done via RPC or separate queries.
- Certificate API relies on RPC `get_course_lectures` – may fail if RPC is missing.

### Tailwind Config

- [tailwind.config.ts](tailwind.config.ts): primary #1e1b4b, Poppins + Hind Siliguri in theme.extend.
- [app/layout.tsx](app/layout.tsx): both fonts loaded.
- [globals.css](app/globals.css): `@import "tailwindcss"` (Tailwind v4).

### Additional Issues

- 404 page links to `/contact` which does not exist.
- Admin course page uses `discount_price`; Course type uses `discounted_price` – possible typo.

---

## TOP PRIORITY FIXES

1. **Exam: One Real Attempt Only**
  Before starting a real exam, query `exam_attempts` for `student_id` + `exam_id` where `is_practice = false`. If exists, block start and show message.
2. **Practice Attempts Not Saved**
  Update [api/exam/submit/route.ts](app/api/exam/submit/route.ts) to skip inserting into `exam_attempts` and `attempt_answers` when `is_practice === true`.
3. **Certificate Auto-Generation**
  Add logic (e.g. API route or trigger) that runs when: (a) all lectures completed and (b) student passes course exam. Call certificate API or generate certificate server-side.
4. **UpcomingExams + Public Exams Links**
  - Change UpcomingExams link from `/exams/public/${exam.id}` to `/exam/${exam.access_link}`.  
  - On public exams page, add `href` or `onClick` to “Take Exam” to navigate to `/exam/${exam.access_link}`.
5. **Admin Notifications Schema/Logic**
  Ensure sending to “all”, “students”, or “teachers” creates one notification row per target user with `user_id`. Either implement server-side fan-out or use a DB function/trigger.
6. **Monthly Payment Approve/Reject**
  Implement backend logic to list, approve, and reject monthly payment requests for offline courses in the admin course detail Payments tab.
7. **Certificate API Fixes**
  - Replace `eq('exam_id.course_id', courseId)` with valid queries or RPC.  
  - Confirm `get_course_lectures` exists and returns the expected structure.
8. **Per-Student Results**
  Replace placeholder results in admin student detail with real data from `exam_attempts` joined to exams.

