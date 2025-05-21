'use client';

import { useState, useEffect } from 'react';
import Banner from '@/app/pages/home/banner';
import PublicCourse from '@/app/pages/home/public-course';
import PublicCombo from '@/app/pages/home/public-combo';
import { useSearchParams, useRouter } from 'next/navigation';
import PaymentService, { VnpayReturnParams, PaymentVerificationResponse } from '@/services/payment-service';
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useEnrollments from '@/hooks/use-my-enrollments';
import WhyChooseJPE from '@/app/pages/home/why-choose';

export default function HomeClient({ dictionary }: { dictionary: any }) {
	const [isMounted, setIsMounted] = useState(false);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [paymentState, setPaymentState] = useState<{
		isProcessing: boolean;
		isSuccess: boolean;
		message: string;
		orderInfo: string;
		amount: number;
		isError: boolean;
	}>({
		isProcessing: false,
		isSuccess: false,
		message: '',
		orderInfo: '',
		amount: 0,
		isError: false,
	});

	const searchParams = useSearchParams();
	const params = useParams();
	const lang = (params.lang as string) || 'vi';
	const router = useRouter();

	// Process payment only once when component is mounted and has VNPay parameters
	useEffect(() => {
		if (!isMounted) return;

		// Check if we have VNPay parameters in the URL
		const hasVnpayParams =
			searchParams && searchParams.get('vnp_ResponseCode') && searchParams.get('vnp_SecureHash');

		if (!hasVnpayParams) return;

		// Don't re-process if we've already done it
		if (showPaymentModal) return;

		const processVnpayReturn = async () => {
			console.log('VNPay parameters detected in URL:', Object.fromEntries(searchParams.entries()));
			setShowPaymentModal(true);
			setPaymentState((prev) => ({ ...prev, isProcessing: true }));

			try {
				// Convert searchParams to an object
				const queryParams: Record<string, string> = {};
				searchParams.forEach((value, key) => {
					queryParams[key] = value;
				});

				// Check if we have the required parameters
				if (
					!queryParams.vnp_ResponseCode ||
					!queryParams.vnp_TxnRef ||
					!queryParams.vnp_Amount ||
					!queryParams.vnp_OrderInfo ||
					!queryParams.vnp_SecureHash
				) {
					throw new Error('Missing required VNPay parameters');
				}

				// VNPay success is indicated by response code '00'
				const isVnpaySuccess = queryParams.vnp_ResponseCode === '00';

				if (!isVnpaySuccess) {
					// If VNPay directly reports failure, don't even call our API
					setPaymentState({
						isProcessing: false,
						isSuccess: false,
						message: 'Payment was declined by the payment provider.',
						orderInfo: queryParams.vnp_OrderInfo || '',
						amount: parseInt(queryParams.vnp_Amount || '0') / 100,
						isError: false,
					});
					return;
				}

				// Process payment verification with backend
				const result = await PaymentService.processVnpayReturn(queryParams as any);
				console.log('Payment verification result:', result);

				// Successful payment
				setPaymentState({
					isProcessing: false,
					isSuccess: true,
					message: result.message || 'Payment processed successfully!',
					orderInfo: result.orderInfo || queryParams.vnp_OrderInfo || '',
					amount: result.amount || parseInt(queryParams.vnp_Amount || '0') / 100,
					isError: false,
				});

				// Clean the URL to remove payment parameters after successful processing
				// This prevents reprocessing on page refresh
				const baseURL = window.location.pathname;
				window.history.replaceState({}, document.title, baseURL);
			} catch (error) {
				console.error('Error processing payment result:', error);
				setPaymentState({
					isProcessing: false,
					isSuccess: false,
					message:
						'An error occurred while processing your payment. The transaction may still have been successful. Please check your account or contact support.',
					orderInfo: '',
					amount: 0,
					isError: true,
				});
			}
		};

		processVnpayReturn();
	}, [isMounted, searchParams, showPaymentModal]);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat(lang === 'jp' ? 'ja-JP' : 'vi-VN', {
			style: 'currency',
			currency: lang === 'jp' ? 'JPY' : 'VND',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	// Handler to close modal and clean URL if needed
	const handleCloseModal = () => {
		setShowPaymentModal(false);

		// Clean the URL if it still has VNPay parameters
		if (window.location.search.includes('vnp_')) {
			const baseURL = window.location.pathname;
			window.history.replaceState({}, document.title, baseURL);
		}
	};

	return (
		<>
			<main>
				<Banner dictionary={dictionary} />
				<PublicCourse dictionary={dictionary} />
				<PublicCombo dictionary={dictionary} />
				<WhyChooseJPE dictionary={dictionary} />
			</main>

			{/* Payment Result Modal */}
			{showPaymentModal && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative'>
						{/* Close button */}
						<button
							className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'
							onClick={handleCloseModal}
						>
							<X className='h-5 w-5' />
						</button>

						{paymentState.isProcessing ? (
							<div className='flex flex-col items-center justify-center py-8'>
								<Loader2 className='h-16 w-16 text-primary animate-spin mb-4' />
								<h2 className='text-2xl font-bold text-gray-800'>
									{dictionary?.payment?.processing || 'Processing Payment'}
								</h2>
								<p className='text-gray-600 text-center mt-2'>
									{dictionary?.payment?.pleaseWait || 'Please wait while we process your payment...'}
								</p>
							</div>
						) : paymentState.isSuccess ? (
							<div className='flex flex-col items-center'>
								<div className='bg-green-100 p-4 rounded-full mb-6'>
									<CheckCircle className='h-16 w-16 text-green-500' />
								</div>
								<h2 className='text-2xl font-bold text-gray-800 text-center'>
									{dictionary?.payment?.successful || 'Payment Successful!'}
								</h2>
								<p className='text-gray-600 text-center mt-2 mb-6'>{paymentState.message}</p>

								{paymentState.orderInfo && (
									<div className='w-full bg-gray-50 rounded-lg p-4 mb-4'>
										<p className='text-gray-600 text-sm'>
											{dictionary?.payment?.orderInfo || 'Order Information:'}
										</p>
										<p className='text-gray-800 font-medium'>{paymentState.orderInfo}</p>
									</div>
								)}

								{paymentState.amount > 0 && (
									<div className='w-full bg-gray-50 rounded-lg p-4 mb-6'>
										<p className='text-gray-600 text-sm'>
											{dictionary?.payment?.amountPaid || 'Amount Paid:'}
										</p>
										<p className='text-gray-800 font-bold text-xl'>
											{formatCurrency(paymentState.amount)}
										</p>
									</div>
								)}

								<div className='flex flex-col sm:flex-row gap-4 w-full'>
									<Button
										className='flex-1'
										onClick={() => {
											router.replace(`/${lang}`);

											setTimeout(() => {
												router.push(`/${lang}/learning`);
											}, 50);
										}}
									>
										{dictionary?.payment?.goToLearning || 'Go to My Learning'}
									</Button>

									<Button variant='superOutline' className='flex-1' onClick={handleCloseModal}>
										{dictionary?.payment?.continueBrowsing || 'Continue Browsing'}
									</Button>
								</div>
							</div>
						) : (
							<div className='flex flex-col items-center'>
								<div className='bg-red-100 p-4 rounded-full mb-6'>
									<XCircle className='h-16 w-16 text-red-500' />
								</div>
								<h2 className='text-2xl font-bold text-gray-800 text-center'>
									{dictionary?.payment?.failed || 'Payment Failed'}
								</h2>
								<p className='text-gray-600 text-center mt-2 mb-6'>{paymentState.message}</p>

								<div className='flex flex-col sm:flex-row gap-4 w-full'>
									<Button asChild className='flex-1'>
										<Link href={`/${lang}/courses`}>
											{dictionary?.payment?.returnToCourses || 'Return to Courses'}
										</Link>
									</Button>
									<Button asChild variant='superOutline' className='flex-1'>
										<Link href={`/${lang}/support`}>
											{dictionary?.payment?.contactSupport || 'Contact Support'}
										</Link>
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
