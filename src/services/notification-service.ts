import api from '@/lib/api';

export interface NotificationResponse {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'COURSE_APPROVED' | 'COURSE_REJECTED' | 'ENROLLMENT' | 'PAYMENT';
  read: boolean;
  actionUrl?: string;
  metadata?: {
    courseId?: number;
    courseName?: string;
    tutorId?: number;
    tutorName?: string;
    paymentId?: number;
    enrollmentId?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationCreateRequest {
  userId: number;
  title: string;
  message: string;
  type: NotificationResponse['type'];
  actionUrl?: string;
  metadata?: NotificationResponse['metadata'];
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

const NotificationService = {
  /**
   * Get all notifications for the current user
   * @param page Page number, starting from 0
   * @param size Number of items per page
   * @param unreadOnly Filter for unread notifications only
   * @returns Paginated notifications
   */
  getMyNotifications: async (
    page = 0,
    size = 10,
    unreadOnly = false
  ): Promise<PaginationResponse<NotificationResponse>> => {
    const response = await api.get<PaginationResponse<NotificationResponse>>(
      `/notifications/my-notifications?page=${page}&size=${size}&unreadOnly=${unreadOnly}`
    );
    return response.data;
  },

  /**
   * Get count of unread notifications
   * @returns Number of unread notifications
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  /**
   * Mark a notification as read
   * @param notificationId ID of the notification
   * @returns Updated notification
   */
  markAsRead: async (notificationId: number): Promise<NotificationResponse> => {
    const response = await api.put<NotificationResponse>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read for the current user
   * @returns Success message
   */
  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/notifications/mark-all-read');
    return response.data;
  },

  /**
   * Delete a notification
   * @param notificationId ID of the notification
   */
  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  /**
   * Create a notification (admin only)
   * @param notificationData Notification data
   * @returns Created notification
   */
  createNotification: async (notificationData: NotificationCreateRequest): Promise<NotificationResponse> => {
    const response = await api.post<NotificationResponse>('/notifications', notificationData);
    return response.data;
  },

  /**
   * Send bulk notifications (admin only)
   * @param userIds Array of user IDs to send to
   * @param notificationData Notification data without userId
   * @returns Success message with count
   */
  sendBulkNotifications: async (
    userIds: number[],
    notificationData: Omit<NotificationCreateRequest, 'userId'>
  ): Promise<{ message: string; count: number }> => {
    const response = await api.post<{ message: string; count: number }>('/notifications/bulk', {
      userIds,
      ...notificationData
    });
    return response.data;
  },

  /**
   * Get notification preferences for the current user
   * @returns User notification preferences
   */
  getNotificationPreferences: async (): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    courseUpdates: boolean;
    paymentNotifications: boolean;
    marketingEmails: boolean;
  }> => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },

  /**
   * Update notification preferences
   * @param preferences Updated preferences
   * @returns Updated preferences
   */
  updateNotificationPreferences: async (preferences: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    courseUpdates?: boolean;
    paymentNotifications?: boolean;
    marketingEmails?: boolean;
  }): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    courseUpdates: boolean;
    paymentNotifications: boolean;
    marketingEmails: boolean;
  }> => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  }
};

export default NotificationService; 