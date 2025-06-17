import api from '@/lib/api';

export interface CreatePaymentRequest {
  amount: number;
  orderInfo: string;
  studentId?: number;
  courseId?: number;
  comboId?: number;
  voucherCode?: string;
  successRedirectUrl: string;
  cancelRedirectUrl: string;
}

export interface GuestPurchaseRequest {
  // Guest user information
  fullName: string;
  email: string;
  phoneNumber?: string;
  subscribeNewsletter?: boolean;

  // Payment information
  amount: number;
  orderInfo: string;
  courseId?: number;
  comboId?: number;
  voucherCode?: string;
  successRedirectUrl: string;
  cancelRedirectUrl: string;
}

export interface CreatePaymentResponse {
  paymentUrl: string;
  transactionId: string;
  orderInfo: string;
}

export interface VnpayReturnParams {
  vnp_ResponseCode?: string;
  vnp_TxnRef?: string;
  vnp_Amount?: string;
  vnp_OrderInfo?: string;
  vnp_SecureHash?: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_PayDate?: string;
  vnp_TransactionNo?: string;
  [key: string]: string | undefined; // Allow for any other VNPay params
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  paymentId?: string;
  orderInfo?: string;
  amount?: number;
  redirectUrl?: string;
}

const PaymentService = {
  /**
   * Creates a payment for authenticated users
   */
  createPayment: async (paymentData: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    const response = await api.post<CreatePaymentResponse>('/payments/create', paymentData);
    return response.data;
  },

  /**
   * Creates a payment for guest users (non-authenticated)
   */
  createGuestPayment: async (paymentData: GuestPurchaseRequest): Promise<CreatePaymentResponse> => {
    const response = await api.post<CreatePaymentResponse>('/guest-purchase/create-payment', paymentData);
    return response.data;
  },

  /**
   * Processes the VNPay return callback
   */
  processVnpayReturn: async (queryParams: VnpayReturnParams): Promise<PaymentVerificationResponse> => {
    const response = await api.get<PaymentVerificationResponse>('/payments/vnpay-return', {
      params: queryParams
    });
    return response.data;
  }
};

export default PaymentService;