'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import {
	ArrowLeftIcon,
	CreditCardIcon,
	UserIcon,
	MailIcon,
	PhoneIcon,
	ShoppingCartIcon,
	CheckIcon,
	PackageIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { useDictionary } from '@/hooks/use-dictionary';
import { safeString, safeImageUrl, formatPrice } from '@/lib/utils';
import ClientOnly from '@/components/client-only';

import ComboService from '@/services/combo-service';
import PaymentService from '@/services/payment-service';

// Form validation schema
const purchaseSchema = z.object({
	fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
	email: z.string().email('Email không hợp lệ'),
	phoneNumber: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số').optional(),
	agreeTerms: z.boolean().refine((val) => val === true, 'Bạn phải đồng ý với điều khoản sử dụng'),
	subscribeNewsletter: z.boolean().optional(),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

// Fallback dictionary
const fallbackDict = {
	combos: {
		buyNow: 'Mua ngay',
		comboLabel: 'Combo',
		includedCourses: 'khóa học',
		savingsLabel: 'Tiết kiệm',
		off: 'giảm',
		processing: 'Đang xử lý...',
		notFound: 'Combo không tìm thấy',
		notFoundMessage: 'Gói combo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
	},
	courses: {
		viewAllCourses: 'Xem các khóa học',
		lessons: 'bài học',
		duration: 'Thời lượng',
		access: 'Quyền truy cập',
		fullLifetimeAccess: 'Truy cập trọn đời',
		certificate: 'Chứng chỉ',
		moneyBackGuarantee: 'Đảm bảo hoàn tiền trong 30 ngày',
	},
	common: {
		home: 'Trang chủ',
		back: 'Quay lại',
	},
};

function PurchaseContent() {
	const params = useParams();
	const router = useRouter();
	const comboId = params.id as string;
	const lang = params.lang as string;
	const [isProcessing, setIsProcessing] = useState(false);

	// Dictionary for translations
	const { data: dictData } = useDictionary(lang);
	const dict = dictData || fallbackDict;

	// Fetch combo details
	const {
		data: combo,
		isLoading: comboLoading,
		error: comboError,
	} = useQuery({
		queryKey: ['combo', comboId],
		queryFn: () =>
			fetch(`/api/combos/${comboId}`).then((res) => {
				if (!res.ok) throw new Error('Failed to fetch combo');
				return res.json();
			}),
		enabled: !!comboId,
	});

	// Form setup
	const form = useForm<PurchaseFormData>({
		resolver: zodResolver(purchaseSchema),
		defaultValues: {
			fullName: '',
			email: '',
			phoneNumber: '',
			agreeTerms: false,
			subscribeNewsletter: false,
		},
	});

	// Payment mutation
	const paymentMutation = useMutation({
		mutationFn: async (data: PurchaseFormData) => {
			const currentUrl = window.location.origin;

			// Prepare guest payment data
			const guestPaymentData: GuestPurchaseRequest = {
				fullName: data.fullName,
				email: data.email,
				phoneNumber: data.phoneNumber,
				subscribeNewsletter: data.subscribeNewsletter,
				amount: combo.discountPrice || combo.price || 0,
				orderInfo: `Mua combo: ${combo.title} - ${data.fullName} (${data.email})`,
				comboId: parseInt(comboId),
				successRedirectUrl: `${currentUrl}/${lang}/payment/success`,
				cancelRedirectUrl: `${currentUrl}/${lang}/combos/${comboId}/purchase`,
			};

			// Use guest payment service instead of regular payment service
			return PaymentService.createGuestPayment(guestPaymentData);
		},
		onSuccess: (response) => {
			// Redirect to VNPay
			window.location.href = response.paymentUrl;
		},
		onError: (error: any) => {
			toast({
				title: 'Lỗi thanh toán',
				description: error.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.',
				variant: 'destructive',
			});
			setIsProcessing(false);
		},
	});

	const onSubmit = (data: PurchaseFormData) => {
		setIsProcessing(true);
		paymentMutation.mutate(data);
	};

	if (comboLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (comboError || !combo) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4'>
				<div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
					<PackageIcon className='w-12 h-12 text-gray-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-800 mb-3'>{dict.combos.notFound}</h1>
				<p className='text-gray-600 text-center max-w-md mb-8'>{dict.combos.notFoundMessage}</p>
				<Link href={`/${lang}/combos`}>
					<Button className='bg-primary hover:bg-primary/90'>{dict.courses.viewAllCourses}</Button>
				</Link>
			</div>
		);
	}

	const hasDiscount = combo.originalPrice && combo.discountPrice && combo.originalPrice > combo.discountPrice;
	const savings = hasDiscount ? combo.originalPrice - combo.discountPrice : 0;
	const savingsPercentage = hasDiscount ? Math.round((savings / combo.originalPrice) * 100) : 0;

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Header */}
			<div className='bg-white border-b border-gray-200'>
				<div className='container mx-auto px-4 py-4'>
					<div className='flex items-center gap-4'>
						<Link href={`/${lang}/combos/${comboId}`}>
							<Button variant='ghost' size='sm'>
								<ArrowLeftIcon className='h-4 w-4 mr-2' />
								{dict.common.back}
							</Button>
						</Link>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>Mua combo</h1>
							<p className='text-gray-600'>Hoàn tất thông tin để mua combo</p>
						</div>
					</div>
				</div>
			</div>

			<div className='container mx-auto px-4 py-8'>
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Left Column - Form */}
					<div className='lg:col-span-2'>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<UserIcon className='h-5 w-5' />
									Thông tin người mua
								</CardTitle>
								<CardDescription>
									Vui lòng cung cấp thông tin để chúng tôi có thể liên hệ và cung cấp quyền truy cập
									khóa học
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
										<FormField
											control={form.control}
											name='fullName'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Họ và tên *</FormLabel>
													<FormControl>
														<Input
															placeholder='Nhập họ và tên đầy đủ'
															{...field}
															disabled={isProcessing}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='email'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email *</FormLabel>
													<FormControl>
														<Input
															type='email'
															placeholder='Nhập địa chỉ email'
															{...field}
															disabled={isProcessing}
														/>
													</FormControl>
													<FormMessage />
													<p className='text-sm text-gray-500'>
														Chúng tôi sẽ gửi thông tin đăng nhập và quyền truy cập khóa học
														qua email này
													</p>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='phoneNumber'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Số điện thoại</FormLabel>
													<FormControl>
														<Input
															type='tel'
															placeholder='Nhập số điện thoại (tùy chọn)'
															{...field}
															disabled={isProcessing}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<Separator />

										<div className='space-y-4'>
											<FormField
												control={form.control}
												name='agreeTerms'
												render={({ field }) => (
													<FormItem className='flex flex-row items-start space-x-3 space-y-0'>
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
																disabled={isProcessing}
															/>
														</FormControl>
														<div className='space-y-1 leading-none'>
															<FormLabel className='text-sm'>
																Tôi đồng ý với{' '}
																<Link
																	href={`/${lang}/terms`}
																	className='text-primary hover:underline'
																>
																	điều khoản sử dụng
																</Link>{' '}
																và{' '}
																<Link
																	href={`/${lang}/privacy`}
																	className='text-primary hover:underline'
																>
																	chính sách bảo mật
																</Link>
															</FormLabel>
															<FormMessage />
														</div>
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name='subscribeNewsletter'
												render={({ field }) => (
													<FormItem className='flex flex-row items-start space-x-3 space-y-0'>
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
																disabled={isProcessing}
															/>
														</FormControl>
														<div className='space-y-1 leading-none'>
															<FormLabel className='text-sm'>
																Đăng ký nhận tin tức và ưu đãi đặc biệt từ JPE
															</FormLabel>
														</div>
													</FormItem>
												)}
											/>
										</div>

										<Alert>
											<CheckIcon className='h-4 w-4' />
											<AlertDescription>
												Sau khi thanh toán thành công, chúng tôi sẽ tự động tạo tài khoản cho
												bạn và gửi thông tin đăng nhập qua email. Bạn có thể ngay lập tức truy
												cập tất cả khóa học trong combo này.
											</AlertDescription>
										</Alert>

										<Button
											type='submit'
											className='w-full bg-gradient-to-r from-secondary to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 py-6 text-lg'
											disabled={isProcessing || !form.formState.isValid}
										>
											{isProcessing ? (
												<>
													<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
													{dict.combos.processing}
												</>
											) : (
												<>
													<CreditCardIcon className='h-5 w-5 mr-2' />
													Thanh toán ngay -{' '}
													{formatPrice(combo.discountPrice || combo.price || 0)}
												</>
											)}
										</Button>
									</form>
								</Form>
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Order Summary */}
					<div className='lg:col-span-1'>
						<Card className='sticky top-6'>
							<CardHeader>
								<CardTitle>Tóm tắt đơn hàng</CardTitle>
							</CardHeader>
							<CardContent className='space-y-6'>
								{/* Combo Info */}
								<div className='flex gap-4'>
									<div className='relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0'>
										<Image
											src={safeImageUrl(combo.thumbnailUrl, '/images/default-combo.jpg')}
											alt={combo.title}
											fill
											className='object-cover'
										/>
									</div>
									<div className='flex-1'>
										<Badge variant='secondary' className='mb-2'>
											<PackageIcon className='w-3 h-3 mr-1' />
											{dict.combos.comboLabel}
										</Badge>
										<h3 className='font-semibold text-sm leading-tight'>{combo.title}</h3>
									</div>
								</div>

								<Separator />

								{/* Course Count */}
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>Số khóa học</span>
									<span className='font-semibold'>
										{combo.courseCount || combo.courses?.length || 0} khóa học
									</span>
								</div>

								{/* Duration */}
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>{dict.courses.duration}</span>
									<span className='font-semibold'>{combo.totalDuration || '40h'}</span>
								</div>

								{/* Access */}
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>{dict.courses.access}</span>
									<span className='font-semibold'>{dict.courses.fullLifetimeAccess}</span>
								</div>

								{/* Certificate */}
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>{dict.courses.certificate}</span>
									<span className='font-semibold'>{combo.hasCertificate ? 'Có' : 'Không'}</span>
								</div>

								<Separator />

								{/* Pricing */}
								<div className='space-y-2'>
									{hasDiscount && (
										<div className='flex justify-between items-center text-gray-500'>
											<span>Giá gốc</span>
											<span className='line-through'>{formatPrice(combo.originalPrice)}</span>
										</div>
									)}
									{hasDiscount && (
										<div className='flex justify-between items-center text-green-600'>
											<span>Giảm giá ({savingsPercentage}%)</span>
											<span>-{formatPrice(savings)}</span>
										</div>
									)}
									<div className='flex justify-between items-center text-lg font-bold'>
										<span>Tổng cộng</span>
										<span className='text-secondary'>
											{formatPrice(combo.discountPrice || combo.price || 0)}
										</span>
									</div>
								</div>

								<Alert>
									<CheckIcon className='h-4 w-4' />
									<AlertDescription className='text-sm'>
										{dict.courses.moneyBackGuarantee}
									</AlertDescription>
								</Alert>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ComboPurchase() {
	return (
		<ClientOnly
			fallback={
				<div className='flex items-center justify-center min-h-screen'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
				</div>
			}
		>
			<PurchaseContent />
		</ClientOnly>
	);
}
