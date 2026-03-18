export type UserRole = 'student' | 'teacher' | 'admin';
export type UserStatus = 'active' | 'pending' | 'rejected';
export type CourseStatus = 'draft' | 'published';
export type EnrollmentStatus = 'pending' | 'active' | 'rejected';
export type ExamType = 'course' | 'public';
export type ExamStatus = 'draft' | 'published' | 'ended';
export type OptionChoice = 'a' | 'b' | 'c' | 'd';
export type PaymentStatus = 'due' | 'pending' | 'paid';
export type NotificationType = 'enrollment' | 'exam' | 'event' | 'general';

export interface Profile {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  class?: 'SSC' | 'HSC' | null;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  subject_expertise?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  intro_video_url?: string;
  main_price: number;
  discounted_price?: number;
  monthly_fee?: number;
  is_offline: boolean;
  teacher_id: string;
  status: CourseStatus;
  class?: 'SSC' | 'HSC' | null;
  subject?: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
}

export interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  description?: string;
  suggestion_pdf_url?: string;
  order_index: number;
}

export interface Lecture {
  id: string;
  chapter_id: string;
  title: string;
  topics?: string;
  content_html?: string;
  video_url?: string;
  order_index: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  payment_platform?: string;
  transaction_id?: string;
  is_offline_course: boolean;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface Exam {
  id: string;
  title: string;
  course_id?: string | null;
  created_by: string;
  exam_type: ExamType;
  duration_minutes: number;
  negative_marking: boolean;
  negative_value: number;
  start_time?: string;
  end_time?: string;
  access_link: string;
  status: ExamStatus;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  question_image_url?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option_a_image?: string;
  option_b_image?: string;
  option_c_image?: string;
  option_d_image?: string;
  correct_option: OptionChoice;
  order_index: number;
}

export interface ExamSet {
  id: string;
  exam_id: string;
  set_number: number;
  shuffled_question_order: string[]; // question ids
  shuffled_options_map: Record<string, Record<OptionChoice, OptionChoice>>;
}

export interface ExamAttempt {
  id: string;
  student_id: string;
  exam_id: string;
  set_id: string;
  started_at: string;
  submitted_at?: string;
  is_practice: boolean;
  score: number;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  time_taken_seconds: number;
}

export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option?: OptionChoice | null;
  is_correct?: boolean;
}

export interface OfflineMonthlyPayment {
  id: string;
  enrollment_id: string;
  student_id: string;
  course_id: string;
  due_date: string;
  month_label: string;
  status: PaymentStatus;
  receipt_number?: string;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  type: NotificationType;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  created_by: string;
  created_at: string;
}

export interface LectureProgress {
  id: string;
  student_id: string;
  lecture_id: string;
  completed_at: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  issued_at: string;
  certificate_url: string;
}
