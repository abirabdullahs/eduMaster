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
  content_markdown?: string;
  tags?: string[];
  mcq_count?: number;
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
  exam_id?: string;
  lecture_id?: string;
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
  completed_at?: string;
  mcq_score?: number;
  mcq_total?: number;
  mcq_passed?: boolean;
  unlocked_at?: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  issued_at: string;
  certificate_url: string;
}

// Free content system types
export type FreeContentType =
  | 'markdown' | 'mcq' | 'short_answer' | 'video' | 'flashcard' | 'true_false'
  | 'fill_blank' | 'latex_formula' | 'image_diagram' | 'key_points'
  | 'match_following' | 'code_snippet' | 'mnemonic';

export type FreeProgressStatus = 'locked' | 'unlocked' | 'completed';

export interface FreeClass {
  id: string;
  name: string;
  order_index: number;
  created_at?: string;
}

export type FreeContentLanguage = 'bangla' | 'hindi' | 'siliguri';

export interface FreeSubject {
  id: string;
  class_id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  language?: FreeContentLanguage;
  order_index: number;
  created_at?: string;
}

export interface FreeChapter {
  id: string;
  subject_id: string;
  name: string;
  description?: string;
  order_index: number;
  created_at?: string;
}

export interface FreeTopic {
  id: string;
  chapter_id: string;
  name: string;
  description?: string;
  order_index: number;
  created_at?: string;
}

// Content data shapes per type
export interface FreeContentMcqOption {
  id: string;
  text: string;
  image?: string;
}

export interface FreeContentDataMap {
  markdown: { body: string };
  mcq: {
    question: string;
    question_image?: string;
    options: FreeContentMcqOption[];
    correct_option: 'a' | 'b' | 'c' | 'd';
    explanation?: string;
  };
  short_answer: {
    question: string;
    correct_answer: string;
    case_sensitive: boolean;
    explanation?: string;
  };
  video: {
    url: string;
    caption?: string;
    duration_minutes?: number;
  };
  flashcard: {
    front: string;
    back: string;
    front_image?: string;
    back_image?: string;
  };
  true_false: {
    statement: string;
    correct_answer: boolean;
    explanation?: string;
  };
  fill_blank: {
    sentence: string;
    correct_answer: string;
    hint?: string;
  };
  latex_formula: {
    title: string;
    formula: string;
    explanation?: string;
    example?: string;
  };
  image_diagram: {
    image_url: string;
    caption: string;
    description?: string;
  };
  key_points: {
    title?: string;
    points: string[];
  };
  match_following: {
    title?: string;
    left: string[];
    right: string[];
    correct_pairs: Record<string, string>;
  };
  code_snippet: {
    language: string;
    code: string;
    explanation?: string;
  };
  mnemonic: {
    topic: string;
    mnemonic: string;
    breakdown?: string;
  };
}

export interface FreeContent {
  id: string;
  topic_id: string;
  title: string;
  content_type: FreeContentType;
  content_data: Record<string, unknown>;
  order_index: number;
  is_free_preview: boolean;
  created_at?: string;
}

export interface FreeContentProgress {
  id: string;
  user_id: string;
  content_id: string;
  status: FreeProgressStatus;
  answer_given?: string;
  is_correct?: boolean;
  completed_at?: string;
}
