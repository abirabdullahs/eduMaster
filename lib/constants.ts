export const APP_NAME = "EduMaster"
export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const

export const EXAM_TYPES = {
  COURSE: 'course',
  PUBLIC: 'public',
} as const

export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REJECTED: 'rejected',
} as const
