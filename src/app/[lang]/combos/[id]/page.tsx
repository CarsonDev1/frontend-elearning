import { getDictionary } from '../../../../lib/dictionary';
import type { Locale } from '../../../../../i18n-config';
import { API_BASE_URL } from '../../../../lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, Star, Package, Percent, Check, Award, BookOpen } from 'lucide-react';
import { safeString, safeImageUrl, safeArrayLength, formatPrice } from '../../../../lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PageProps {
	params: {
		id: string;
		lang: Locale;
	};
}

async function getComboDetails(id: string) {
	try {
		const response = await fetch(`${API_BASE_URL}/combos/${id}`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch combo: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching combo details:', error);
		return null;
	}
}

export default async function ComboDetailsPage({ params: { id, lang } }: PageProps) {
	const dictionary = await getDictionary(lang);
	const combo = await getComboDetails(id);

	// Ensure dictionary exists to prevent errors
	const dict = dictionary || {};
	const comboDict = dict.combos || {};
	const courseDict = dict.courses || {};
	const commonDict = dict.common || {};

	// Handle case when combo is not found
	if (!combo) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4'>
				<div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
					<Package className='w-12 h-12 text-gray-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-800 mb-3'>
					{comboDict.notFound || 'Combo không tìm thấy'}
				</h1>
				<p className='text-gray-600 text-center max-w-md mb-8'>
					{comboDict.notFoundMessage || 'Gói combo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'}
				</p>
				<Link href={`/${lang}/courses`}>
					<Button className='bg-primary hover:bg-primary/90'>
						{courseDict.viewAllCourses || 'Xem các khóa học'}
					</Button>
				</Link>
			</div>
		);
	}

	const hasDiscount = combo.originalPrice && combo.discountPrice && combo.originalPrice > combo.discountPrice;
	const savings = hasDiscount ? combo.originalPrice - combo.discountPrice : 0;
	const savingsPercentage = hasDiscount ? Math.round((savings / combo.originalPrice) * 100) : 0;

	return (
		<div className='min-h-screen bg-gray-50 pb-20'>
			{/* Breadcrumb */}
			<div className='bg-white border-b border-gray-200'>
				<div className='container mx-auto px-4 py-3 flex items-center text-sm'>
					<Link href={`/${lang}`} className='text-gray-500 hover:text-primary'>
						{commonDict.home || 'Trang chủ'}
					</Link>
					<span className='mx-2 text-gray-400'>/</span>
					<Link href={`/${lang}/courses`} className='text-gray-500 hover:text-primary'>
						{courseDict.pageTitle || 'Khóa học'}
					</Link>
					<span className='mx-2 text-gray-400'>/</span>
					<span className='text-gray-900'>{comboDict.comboLabel || 'Combo'}</span>
				</div>
			</div>

			{/* Hero Section */}
			<div className='bg-gradient-to-r from-secondary/10 to-primary/5 pt-12 pb-8 mb-10'>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex flex-col md:flex-row gap-8 items-center'>
						{/* Combo Image */}
						<div className='w-full md:w-2/5 lg:w-1/3'>
							<div className='relative aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-xl border-8 border-white'>
								<Image
									src={safeImageUrl(
										combo.imageUrl || combo.thumbnailUrl,
										'/images/default-combo.jpg'
									)}
									alt={safeString(combo.title, 'Combo Package')}
									fill
									className='object-cover'
									priority
								/>
								{hasDiscount && (
									<div className='absolute top-4 left-4'>
										<div className='bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2'>
											<Percent className='w-4 h-4' />
											<span className='font-bold'>
												{savingsPercentage}% {comboDict.off || 'giảm'}
											</span>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Combo Info */}
						<div className='w-full md:w-3/5 lg:w-2/3'>
							<div className='flex flex-wrap gap-3 mb-4'>
								<Badge variant='secondary' className='px-3 py-1 text-sm font-medium'>
									<Package className='w-4 h-4 mr-1' />
									{comboDict.comboLabel || 'Combo'}
								</Badge>
								<Badge variant='outline' className='px-3 py-1 text-sm font-medium bg-white'>
									<BookOpen className='w-4 h-4 mr-1' />
									{combo.courseCount || safeArrayLength(combo.courses) || 0}{' '}
									{comboDict.includedCourses || 'Khóa học bao gồm'}
								</Badge>
							</div>

							<h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
								{safeString(combo.title, 'Combo Package')}
							</h1>

							<p className='text-lg text-gray-700 mb-6 leading-relaxed'>
								{safeString(
									combo.description,
									'Complete learning package with multiple courses designed for comprehensive skill development.'
								)}
							</p>

							<div className='flex flex-wrap gap-6 mb-6'>
								<div className='flex items-center gap-2'>
									<Clock className='w-5 h-5 text-gray-500' />
									<span className='text-gray-700'>{safeString(combo.totalDuration, '40h')}</span>
								</div>

								<div className='flex items-center gap-2'>
									<Users className='w-5 h-5 text-gray-500' />
									<span className='text-gray-700'>
										{combo.enrolledCount || 0} {courseDict.students || 'học viên'}
									</span>
								</div>

								<div className='flex items-center gap-2'>
									<Star className='w-5 h-5 fill-yellow-400 text-yellow-400' />
									<span className='text-gray-700'>
										{combo.rating || '4.9'} ({combo.reviewCount || 0}{' '}
										{courseDict.reviews || 'đánh giá'})
									</span>
								</div>
							</div>

							<div className='mb-8'>
								<div className='flex items-end gap-3 mb-2'>
									<span className='text-3xl font-bold text-secondary'>
										{formatPrice(combo.discountPrice || combo.price || 0)}
									</span>
									{hasDiscount && (
										<span className='text-xl text-gray-400 line-through'>
											{formatPrice(combo.originalPrice)}
										</span>
									)}
								</div>
								{hasDiscount && (
									<p className='text-sm text-green-600 font-medium'>
										{comboDict.savingsLabel || 'Tiết kiệm'} {formatPrice(savings)} (
										{savingsPercentage}%)
									</p>
								)}
							</div>

							<div className='flex flex-wrap gap-4'>
								<Button
									className='bg-gradient-to-r from-secondary to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105'
									size='lg'
								>
									<span className='flex items-center justify-center gap-2'>
										{comboDict.enrollNow || 'Đăng ký ngay'}
										<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M13 7l5 5m0 0l-5 5m5-5H6'
											/>
										</svg>
									</span>
								</Button>

								<Button
									variant='superOutline'
									className='bg-white border-gray-300 hover:bg-gray-100 text-gray-800 px-6 py-6 rounded-xl'
									size='lg'
								>
									<span className='flex items-center justify-center gap-2'>
										<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
											/>
										</svg>
										{comboDict.viewDetails || 'Xem chi tiết'}
									</span>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>
					{/* Left Column - Course List */}
					<div className='lg:col-span-2'>
						<div className='bg-white rounded-2xl shadow-md p-8 mb-10'>
							<h2 className='text-2xl font-bold text-gray-900 mb-6'>
								{comboDict.includedCourses || 'Khóa học bao gồm'}
							</h2>

							<div className='space-y-6'>
								{Array.isArray(combo.courses) && combo.courses.length > 0 ? (
									combo.courses.map((course: any, idx: number) => (
										<div
											key={idx}
											className='flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-xl hover:border-secondary/20 hover:shadow-md transition-all duration-300'
										>
											{/* Course Thumbnail */}
											<div className='relative w-full sm:w-40 h-32 rounded-lg overflow-hidden flex-shrink-0'>
												<Image
													src={safeImageUrl(
														course.imageUrl || course.thumbnailUrl,
														'/images/default-course.jpg'
													)}
													alt={safeString(course.title, `Course ${idx + 1}`)}
													fill
													className='object-cover'
												/>
											</div>

											{/* Course Info */}
											<div className='flex-1'>
												<h3 className='text-lg font-semibold text-gray-900 mb-2'>
													{safeString(course.title, `Course ${idx + 1}`)}
												</h3>

												<p className='text-sm text-gray-600 mb-3 line-clamp-2'>
													{safeString(
														course.description,
														'Course description not available.'
													)}
												</p>

												<div className='flex flex-wrap gap-4 text-sm text-gray-500'>
													<div className='flex items-center gap-1'>
														<Clock className='w-4 h-4' />
														<span>
															{safeString(
																course.duration || course.durationInMinutes,
																'2h'
															)}
														</span>
													</div>

													<div className='flex items-center gap-1'>
														<BookOpen className='w-4 h-4' />
														<span>
															{course.lessonCount || 0} {courseDict.lessons || 'bài học'}
														</span>
													</div>

													<div className='flex items-center gap-1'>
														<Award className='w-4 h-4' />
														<span>{safeString(course.level, 'Beginner')}</span>
													</div>
												</div>
											</div>
										</div>
									))
								) : (
									<div className='text-center py-10'>
										<Package className='w-12 h-12 text-gray-300 mx-auto mb-4' />
										<p className='text-gray-500'>
											{comboDict.noCourses || 'Chưa có khóa học nào trong combo này.'}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* What You'll Learn */}
						<div className='bg-white rounded-2xl shadow-md p-8 mb-10'>
							<h2 className='text-2xl font-bold text-gray-900 mb-6'>
								{courseDict.overview || 'Tổng quan'}
							</h2>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{(combo.learningPoints || []).slice(0, 8).map((point: string, idx: number) => (
									<div key={idx} className='flex items-start gap-3'>
										<div className='mt-1 flex-shrink-0'>
											<Check className='w-5 h-5 text-green-500' />
										</div>
										<p className='text-gray-700'>{point}</p>
									</div>
								))}

								{(!combo.learningPoints || combo.learningPoints.length === 0) && (
									<div className='col-span-2'>
										<div className='flex items-start gap-3'>
											<div className='mt-1 flex-shrink-0'>
												<Check className='w-5 h-5 text-green-500' />
											</div>
											<p className='text-gray-700'>
												{lang === 'vi'
													? 'Thành thạo kỹ năng tiếng Nhật thông qua các khóa học toàn diện'
													: '総合的なコースを通じて日本語スキルを習得'}
											</p>
										</div>
										<div className='flex items-start gap-3 mt-4'>
											<div className='mt-1 flex-shrink-0'>
												<Check className='w-5 h-5 text-green-500' />
											</div>
											<p className='text-gray-700'>
												{lang === 'vi'
													? 'Chuẩn bị hiệu quả cho chứng chỉ JLPT'
													: 'JLPT認定に向けて効果的に準備'}
											</p>
										</div>
										<div className='flex items-start gap-3 mt-4'>
											<div className='mt-1 flex-shrink-0'>
												<Check className='w-5 h-5 text-green-500' />
											</div>
											<p className='text-gray-700'>
												{lang === 'vi'
													? 'Phát triển kỹ năng hội thoại thực tế cho cuộc sống hàng ngày và công việc'
													: '日常生活や仕事のための実践的な会話スキルを開発'}
											</p>
										</div>
										<div className='flex items-start gap-3 mt-4'>
											<div className='mt-1 flex-shrink-0'>
												<Check className='w-5 h-5 text-green-500' />
											</div>
											<p className='text-gray-700'>
												{lang === 'vi'
													? 'Học từ các giảng viên được chứng nhận với nhiều năm kinh nghiệm giảng dạy'
													: '長年の教育経験を持つ認定講師から学ぶ'}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Requirements */}
						<div className='bg-white rounded-2xl shadow-md p-8'>
							<h2 className='text-2xl font-bold text-gray-900 mb-6'>
								{courseDict.requirements || 'Yêu cầu'}
							</h2>

							<ul className='space-y-4 list-disc pl-5'>
								{(combo.requirements || []).map((req: string, idx: number) => (
									<li key={idx} className='text-gray-700'>
										{req}
									</li>
								))}

								{(!combo.requirements || combo.requirements.length === 0) && (
									<>
										<li className='text-gray-700'>
											{lang === 'vi'
												? 'Không yêu cầu kiến thức tiếng Nhật trước đó cho các khóa học cho người mới bắt đầu'
												: '初心者コースには事前の日本語知識は必要ありません'}
										</li>
										<li className='text-gray-700'>
											{lang === 'vi'
												? 'Kỹ năng máy tính cơ bản để truy cập tài liệu khóa học trực tuyến'
												: 'オンラインコース教材にアクセスするための基本的なコンピュータースキル'}
										</li>
										<li className='text-gray-700'>
											{lang === 'vi' ? 'Cam kết thực hành thường xuyên' : '定期的に練習する意欲'}
										</li>
										<li className='text-gray-700'>
											{lang === 'vi'
												? 'Kết nối internet để xem bài giảng video'
												: 'ビデオレッスンを視聴するためのインターネット接続'}
										</li>
									</>
								)}
							</ul>
						</div>
					</div>

					{/* Right Column - Sidebar */}
					<div className='lg:col-span-1'>
						{/* Combo Summary Card */}
						<div className='bg-white rounded-2xl shadow-md p-6 mb-6 sticky top-24'>
							<h3 className='text-xl font-bold text-gray-900 mb-4'>
								{comboDict.summary || 'Tóm tắt combo'}
							</h3>

							<div className='space-y-4 mb-6'>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>{courseDict.pageTitle || 'Khóa học'}</span>
									<span className='font-semibold'>
										{combo.courseCount || safeArrayLength(combo.courses) || 0}
									</span>
								</div>

								<Separator />

								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>{courseDict.lessons || 'Bài học'}</span>
									<span className='font-semibold'>{combo.lessonCount || 0}</span>
								</div>

								<Separator />

								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>{courseDict.duration || 'Thời lượng'}</span>
									<span className='font-semibold'>{safeString(combo.totalDuration, '40h')}</span>
								</div>

								<Separator />

								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>{courseDict.access || 'Quyền truy cập'}</span>
									<span className='font-semibold'>
										{courseDict.fullLifetimeAccess || 'Truy cập trọn đời'}
									</span>
								</div>

								<Separator />

								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>{courseDict.certificate || 'Chứng chỉ'}</span>
									<span className='font-semibold'>{combo.hasCertificate ? 'Có' : 'Không'}</span>
								</div>
							</div>

							<Button className='w-full bg-gradient-to-r from-secondary to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300'>
								{comboDict.enrollNow || 'Đăng ký ngay'}
							</Button>

							<p className='text-center text-sm text-gray-500 mt-4'>
								{courseDict.moneyBackGuarantee || 'Đảm bảo hoàn tiền trong 30 ngày'}
							</p>
						</div>

						{/* Instructor Card */}
						{combo.instructor && (
							<div className='bg-white rounded-2xl shadow-md p-6'>
								<h3 className='text-xl font-bold text-gray-900 mb-4'>
									{courseDict.instructor || 'Giảng viên'}
								</h3>

								<div className='flex items-center gap-4 mb-4'>
									<Avatar className='w-16 h-16'>
										<AvatarImage src={safeImageUrl(combo.instructor.avatarUrl, '')} />
										<AvatarFallback className='bg-secondary/10 text-secondary font-semibold'>
											{safeString(combo.instructor.name, 'T').charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>

									<div>
										<h4 className='font-semibold text-gray-900'>
											{safeString(combo.instructor.name, 'Instructor Name')}
										</h4>
										<p className='text-sm text-gray-500'>
											{safeString(combo.instructor.title, 'Japanese Language Instructor')}
										</p>
									</div>
								</div>

								<p className='text-sm text-gray-700 leading-relaxed'>
									{safeString(
										combo.instructor.bio,
										lang === 'vi'
											? 'Giảng viên tiếng Nhật giàu kinh nghiệm với chuyên môn trong việc chuẩn bị cho học viên thi chứng chỉ JLPT.'
											: 'JLPT認定の準備において学生をサポートする専門知識を持つ経験豊富な日本語講師。'
									)}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
