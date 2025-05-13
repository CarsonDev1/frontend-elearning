'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CourseService from '@/services/course-service';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Interface for Course
interface Course {
	id: number;
	title: string;
	description: string;
	price: number;
	thumbnailUrl: string;
	thumbnailPublicId: string | null;
	approved: boolean;
	active: boolean;
	level: string;
	instructorId: number;
	instructorName: string;
	averageRating: number | null;
	reviewCount: number;
}

// Currency formatter
const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
		minimumFractionDigits: 0,
	}).format(amount);
};

// Helper function to validate image URL
const isValidImageUrl = (url: string): boolean => {
	if (!url) return false;

	try {
		// Check if it's an absolute URL or starts with /
		return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
	} catch (e) {
		return false;
	}
};

// Course Detail Skeleton Component
const CourseDetailSkeleton: React.FC = () => {
	return (
		<div className='max-h-[80vh] overflow-y-auto'>
			{/* Image skeleton */}
			<div className='relative h-64 w-full mb-6 bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden'>
				<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>

				{/* Level badge skeleton */}
				<div className='absolute top-4 right-4'>
					<div className='h-6 w-20 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
				</div>

				{/* Status badges skeleton */}
				<div className='absolute bottom-4 left-4 flex space-x-2'>
					<div className='h-6 w-24 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
					<div className='h-6 w-20 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
				</div>
			</div>

			<div className='space-y-6'>
				{/* Title and instructor skeleton */}
				<div>
					<div className='h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-3/4 mb-4 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
					<div className='h-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-1/3 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
				</div>

				{/* Ratings skeleton */}
				<div className='h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-1/4 relative overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
				</div>

				{/* Description skeleton */}
				<div className='border-t border-b py-4 border-gray-200'>
					<div className='h-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-1/5 mb-3 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
					<div className='h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-full mb-2 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
					<div className='h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-full mb-2 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
					<div className='h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-3/4 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
				</div>

				{/* Price and buttons skeleton */}
				<div className='flex justify-between items-center'>
					<div className='h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-1/5 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
					<div className='flex space-x-3'>
						<div className='h-10 w-24 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden'>
							<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
						</div>
						<div className='h-10 w-32 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden'>
							<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Course Detail Component
const CourseDetail: React.FC<{
	courseId: number | null;
	onClose: () => void;
	onRefresh?: () => void;
}> = ({ courseId, onClose, onRefresh }) => {
	const {
		data: courseDetail,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['instructorCourse', courseId],
		queryFn: () => (courseId ? CourseService.getPublicCourseById(courseId) : null),
		enabled: !!courseId,
	});

	if (isLoading) {
		return <CourseDetailSkeleton />;
	}

	if (isError || !courseDetail) {
		return (
			<div className='p-6'>
				<h3 className='text-red-500 font-medium'>Error loading course details</h3>
				<p className='text-gray-600 mt-2'>Please try again later.</p>
			</div>
		);
	}

	const course: any = courseDetail;

	return (
		<div className='max-h-[80vh] overflow-y-auto'>
			<div className='relative h-64 w-full mb-6'>
				{isValidImageUrl(course.thumbnailUrl) ? (
					<Image src={course.thumbnailUrl} alt={course.title} fill className='object-cover' />
				) : (
					<div className='w-full h-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center'>
						<span className='text-blue-500 font-bold text-6xl'>{course.title[0] || 'C'}</span>
					</div>
				)}
				<div className='absolute top-4 right-4 flex space-x-2'>
					{course.level && (
						<span className='bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1 rounded-full font-medium shadow-md'>
							{course.level}
						</span>
					)}
				</div>

				{/* Status badges */}
				<div className='absolute bottom-4 left-4 flex space-x-2'>
					<span
						className={`px-3 py-1 rounded-full font-medium text-xs ${
							course.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
						}`}
					>
						{course.approved ? 'Approved' : 'Pending Approval'}
					</span>

					<span
						className={`px-3 py-1 rounded-full font-medium text-xs ${
							course.active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
						}`}
					>
						{course.active ? 'Active' : 'Inactive'}
					</span>
				</div>
			</div>

			<div className='space-y-6'>
				<div>
					<h2 className='text-2xl font-bold text-gray-800'>{course.title}</h2>
					<div className='flex items-center mt-2 text-sm text-gray-600'>
						<User className='w-4 h-4 mr-1 text-gray-500' />
						<span className='font-medium'>{course.instructorName}</span>
					</div>
				</div>

				{course.averageRating !== null ? (
					<div className='flex items-center'>
						<div className='flex text-yellow-400'>
							{[...Array(5)].map((_, i) => (
								<svg
									key={i}
									className={`w-5 h-5 ${
										i < Math.round(course.averageRating || 0) ? 'fill-current' : 'text-gray-200'
									}`}
									viewBox='0 0 20 20'
								>
									<path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
								</svg>
							))}
						</div>
						<span className='ml-2 text-gray-600 font-medium'>
							{course.averageRating.toFixed(1)} ({course.reviewCount}{' '}
							{course.reviewCount === 1 ? 'review' : 'reviews'})
						</span>
					</div>
				) : (
					<div className='text-gray-500 flex items-center'>
						<svg
							className='w-5 h-5 mr-1 text-gray-400'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
							/>
						</svg>
						<span>No ratings yet</span>
					</div>
				)}

				<div className='border-t border-b py-4 border-gray-200'>
					<h3 className='font-bold text-gray-700 mb-2'>Description</h3>
					<p className='text-gray-600 whitespace-pre-line'>
						{course.description || 'No description available'}
					</p>
				</div>

				<div className='flex justify-between items-center'>
					<div className='text-2xl font-bold text-blue-600'>{formatCurrency(course.price)}</div>
					<div className='space-x-3'>
						<Link
							href={`/instructor/courses/${course.id}/edit`}
							className='inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all'
						>
							Edit Course
						</Link>
						<Link
							href={`/instructor/courses/${course.id}/manage`}
							className='inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md'
						>
							Manage Content
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

// Course Skeleton for loading state
const CourseSkeleton: React.FC = () => {
	return (
		<div className='bg-white rounded-xl shadow-md overflow-hidden border border-gray-100'>
			{/* Image skeleton */}
			<div className='h-52 w-full bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden'>
				<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>

				{/* Level badge skeleton */}
				<div className='absolute top-3 right-3'>
					<div className='w-16 h-5 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
				</div>

				{/* Status badges skeleton */}
				<div className='absolute bottom-3 left-3 flex space-x-2'>
					<div className='w-16 h-5 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
					<div className='w-14 h-5 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
				</div>
			</div>

			<div className='p-5'>
				{/* Title skeleton */}
				<div className='h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-3/4 mb-3 relative overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
				</div>
				<div className='h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-1/2 mb-3 relative overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
				</div>

				{/* Instructor skeleton */}
				<div className='h-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-1/3 mb-3 relative overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
				</div>

				{/* Ratings skeleton */}
				<div className='h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-1/4 mb-3 relative overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
				</div>

				{/* Description skeleton */}
				<div className='h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-full mb-2 relative overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
				</div>
				<div className='h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-4/5 mb-4 relative overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
				</div>

				{/* Price and buttons skeleton */}
				<div className='flex justify-between items-center'>
					<div className='h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-1/4 relative overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
					</div>
					<div className='flex space-x-2'>
						<div className='h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-14 relative overflow-hidden'>
							<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
						</div>
						<div className='h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-24 relative overflow-hidden'>
							<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Page Header Skeleton
const PageHeaderSkeleton: React.FC = () => {
	return (
		<>
			{/* Title skeleton */}
			<div className='h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md w-1/3 mb-6 relative overflow-hidden'>
				<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
			</div>

			{/* Button skeleton */}
			<div className='flex justify-end mb-6'>
				<div className='h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-48 relative overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent skeleton-shine'></div>
				</div>
			</div>
		</>
	);
};

export default function CoursesPage() {
	const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

	// Fetch instructor courses
	const {
		data: courses,
		isLoading,
		isError,
		error,
		refetch: refetchCourses,
	} = useQuery<any>({
		queryKey: ['instructorCourses'],
		queryFn: CourseService.getInstructorCourses,
	});

	const handleViewDetails = (courseId: number) => {
		setSelectedCourseId(courseId);
		setIsDetailDialogOpen(true);
	};

	const handleCloseDetailDialog = () => {
		setIsDetailDialogOpen(false);
		setSelectedCourseId(null);
	};

	// Define a style for skeleton animation
	const skeletonStyle = `
    @keyframes skeleton-shine {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    .skeleton-shine {
      animation: skeleton-shine 1.5s infinite;
    }
  `;

	if (isError) {
		return (
			<div className='container mx-auto py-10'>
				<div className='bg-red-50 border-l-4 border-red-500 p-4 rounded-md'>
					<div className='flex'>
						<div className='flex-shrink-0'>
							<svg
								className='h-5 w-5 text-red-500'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
						</div>
						<div className='ml-3'>
							<h3 className='text-sm font-medium text-red-800'>Error loading courses</h3>
							<div className='mt-2 text-sm text-red-700'>
								<p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='w-full mx-auto py-5'>
			<style>{skeletonStyle}</style>

			{isLoading ? (
				<>
					<PageHeaderSkeleton />
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{[...Array(8)].map((_, index) => (
							<CourseSkeleton key={index} />
						))}
					</div>
				</>
			) : (
				<>
					<h1 className='text-3xl font-bold mb-6 text-gray-800 border-b pb-4'>
						<span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400'>
							My Courses
						</span>
					</h1>

					{courses && courses.length === 0 ? (
						<div className='col-span-full py-16 text-center'>
							<div className='bg-white rounded-xl shadow-md p-8 max-w-lg mx-auto'>
								<svg
									className='h-12 w-12 text-gray-400 mx-auto mb-4'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={1.5}
										d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
									/>
								</svg>
								<h2 className='text-xl font-bold mb-2 text-gray-800'>
									You haven't created any courses yet
								</h2>
								<p className='text-gray-600 mb-4'>Get started by creating your first course</p>
								<Button className='px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md'>
									<Plus className='mr-2 h-4 w-4' />
									Create Your First Course
								</Button>
							</div>
						</div>
					) : (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
							{courses &&
								courses.map((course: Course) => (
									<div
										key={course.id}
										className='bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-102 border border-gray-100'
									>
										<div className='relative h-52 w-full'>
											{isValidImageUrl(course.thumbnailUrl) ? (
												<Image
													src={course.thumbnailUrl}
													alt={course.title}
													fill
													className='object-cover'
												/>
											) : (
												<div className='w-full h-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center'>
													<span className='text-blue-500 font-bold text-4xl'>
														{course.title[0] || 'C'}
													</span>
												</div>
											)}
											{course.level && (
												<span className='absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md'>
													{course.level}
												</span>
											)}

											{/* Status badges */}
											<div className='absolute bottom-3 left-3 flex space-x-2'>
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${
														course.approved
															? 'bg-green-100 text-green-800'
															: 'bg-yellow-100 text-yellow-800'
													}`}
												>
													{course.approved ? 'Approved' : 'Pending'}
												</span>

												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${
														course.active
															? 'bg-blue-100 text-blue-800'
															: 'bg-gray-100 text-gray-800'
													}`}
												>
													{course.active ? 'Active' : 'Inactive'}
												</span>
											</div>
										</div>

										<div className='p-5'>
											<h3 className='font-bold text-lg mb-2 text-gray-800 line-clamp-2 h-14'>
												{course.title}
											</h3>

											<div className='flex items-center text-sm text-gray-600 mb-2'>
												<User className='w-4 h-4 mr-1 text-gray-500' />
												<span className='font-medium'>{course.instructorName}</span>
											</div>

											{course.averageRating !== null ? (
												<div className='flex items-center mb-3'>
													<div className='flex text-yellow-400'>
														{[...Array(5)].map((_, i) => (
															<svg
																key={i}
																className={`w-4 h-4 ${
																	i < Math.round(course.averageRating || 0)
																		? 'fill-current'
																		: 'text-gray-200'
																}`}
																viewBox='0 0 20 20'
															>
																<path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
															</svg>
														))}
													</div>
													<span className='ml-2 text-sm text-gray-600 font-medium'>
														({course.reviewCount || 0})
													</span>
												</div>
											) : (
												<div className='text-sm text-gray-500 mb-3 flex items-center'>
													<svg
														className='w-4 h-4 mr-1 text-gray-400'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'
														xmlns='http://www.w3.org/2000/svg'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
														/>
													</svg>
													<span>No ratings yet</span>
												</div>
											)}

											<p className='text-gray-600 mb-4 text-sm line-clamp-2 h-10'>
												{course.description || 'No description available'}
											</p>

											<div className='flex justify-between items-center mt-2'>
												<div className='text-lg font-bold text-blue-600'>
													{formatCurrency(course.price)}
												</div>
												<div className='flex space-x-2'>
													<Link
														href={`/instructor/courses/${course.id}/edit`}
														className='px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-all'
													>
														Edit
													</Link>
													<button
														onClick={() => handleViewDetails(course.id)}
														className='px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md'
													>
														View Details
													</button>
												</div>
											</div>
										</div>
									</div>
								))}
						</div>
					)}
				</>
			)}

			{/* Course Details Dialog */}
			<Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
				<DialogContent className='sm:max-w-3xl'>
					<DialogHeader>
						<DialogTitle className='sr-only'>Course Details</DialogTitle>
					</DialogHeader>
					<CourseDetail
						courseId={selectedCourseId}
						onClose={handleCloseDetailDialog}
						onRefresh={refetchCourses}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
