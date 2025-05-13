import api from '@/lib/api';

export interface Level {
  id: number;
  name: string;
  description: string;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TutorInfo {
  id: number;
  fullName: string;
  avatarUrl: string;
  teachingRequirements: string;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: number;
  content: string;
  correct: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  content: string;
  hint: string;
  correctAnswer: string;
  answerExplanation: string;
  points: number;
  options: QuestionOption[];
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: number;
  title: string;
  description: string;
  type: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK' | 'MATCHING';
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  durationInMinutes: number;
  content: string;
  position: number;
  resources: Resource[];
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: number;
  title: string;
  durationInMinutes: number;
  position: number;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  durationInMinutes: number;
  level: Level;
  lessonCount: number;
  courseOverview: string;
  courseContent: string;
  price: number;
  thumbnailUrl: string;
  includesDescription: string;
  tutor: TutorInfo;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  modules: Module[];
}

export interface CourseApproval {
  status: 'APPROVED' | 'REJECTED';
  feedback?: string;
}

export interface PaginationResponse<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  sort: any;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: any;
  empty: boolean;
}

const CourseService = {
  /**
   * Lấy danh sách tất cả khóa học (chỉ admin)
   * @param page Số trang, bắt đầu từ 0
   * @param size Số lượng trên mỗi trang
   * @param sortBy Trường để sắp xếp
   * @param direction Hướng sắp xếp (asc hoặc desc)
   */
  getAllCourses: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<PaginationResponse<Course>> => {
    const response = await api.get<PaginationResponse<Course>>(
      `/admin/courses?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data;
  },

  /**
   * Lấy danh sách khóa học đang chờ phê duyệt
   * @param page Số trang, bắt đầu từ 0
   * @param size Số lượng trên mỗi trang
   * @param sortBy Trường để sắp xếp
   * @param direction Hướng sắp xếp (asc hoặc desc)
   */
  getPendingCourses: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<PaginationResponse<Course>> => {
    const response = await api.get<PaginationResponse<Course>>(
      `/admin/courses/pending?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data;
  },

  /**
   * Lấy chi tiết khóa học theo ID
   * @param courseId ID của khóa học
   */
  getCourseById: async (courseId: number): Promise<Course> => {
    const response = await api.get<Course>(`/admin/courses/${courseId}`);
    return response.data;
  },

  /**
   * Phê duyệt hoặc từ chối khóa học
   * @param courseId ID của khóa học
   * @param approvalData Dữ liệu phê duyệt
   */
  approveCourse: async (courseId: number, status: 'APPROVED'): Promise<Course> => {
    const response = await api.put<Course>(`/admin/courses/${courseId}/approval`, {
      status
    });
    return response.data;
  },

  /**
   * Từ chối khóa học
   * @param courseId ID của khóa học
   * @param feedback Phản hồi từ chối
   */
  rejectCourse: async (courseId: number, feedback: string): Promise<Course> => {
    const response = await api.put<Course>(`/admin/courses/${courseId}/approval`, {
      status: 'REJECTED',
      feedback
    });
    return response.data;
  },

  /**
   * Xóa khóa học
   * @param courseId ID của khóa học
   */
  deleteCourse: async (courseId: number): Promise<void> => {
    await api.delete(`/admin/courses/${courseId}`);
  }
};

export default CourseService;