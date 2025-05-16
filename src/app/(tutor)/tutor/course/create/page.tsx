'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Icons
import { Loader2, ArrowLeft, Pencil, BookCopy, LayoutGrid, Star, Eye, Save, Send } from 'lucide-react';

// Services
import TutorCourseService from '@/services/tutor-course-service';
import LevelsService from '@/services/levels-service';
import Sidebar from '@/app/(tutor)/tutor/components/sidebar';
import BasicInfoTab from '@/app/(tutor)/tutor/components/basic-info';
import CourseContentTab from '@/app/(tutor)/tutor/components/course-content';
import ModulesTab from '@/app/(tutor)/tutor/components/module-tab';
import PricingTab from '@/app/(tutor)/tutor/components/pricing';
import PreviewTab from '@/app/(tutor)/tutor/components/privew-tab';

// Define the schema for form validation
// Define a QuestionOption schema
const questionOptionSchema = z.object({
	content: z.string().min(1, 'Nội dung lựa chọn là bắt buộc'),
	correct: z.boolean().default(false),
});

// Define a Question schema
const questionSchema = z.object({
	content: z.string().min(1, 'Nội dung câu hỏi là bắt buộc'),
	hint: z.string().optional(),
	correctAnswer: z.string().optional(),
	answerExplanation: z.string().min(1, 'Giải thích đáp án là bắt buộc'),
	points: z.number().min(1, 'Điểm số phải lớn hơn 0').default(1),
	options: z.array(questionOptionSchema).min(2, 'Phải có ít nhất 2 lựa chọn'),
});

// Define an Exercise schema
const exerciseSchema = z.object({
	title: z.string().min(1, 'Tiêu đề bài tập là bắt buộc'),
	description: z.string().min(1, 'Mô tả bài tập là bắt buộc'),
	type: z.enum(['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK', 'MATCHING']),
	questions: z.array(questionSchema).min(1, 'Phải có ít nhất 1 câu hỏi'),
});

// Define a Resource schema
const resourceSchema = z.object({
	title: z.string().min(1, 'Tiêu đề tài liệu là bắt buộc'),
	description: z.string().min(1, 'Mô tả tài liệu là bắt buộc'),
	fileUrl: z.string().min(1, 'URL tài liệu là bắt buộc'),
	fileType: z.string().min(1, 'Loại tài liệu là bắt buộc'),
});

// Define a Lesson schema
const lessonSchema = z.object({
	title: z.string().min(1, 'Tiêu đề bài học là bắt buộc'),
	description: z.string().min(1, 'Mô tả bài học là bắt buộc'),
	videoUrl: z.string().min(1, 'Video bài học là bắt buộc'),
	durationInMinutes: z.number().min(1, 'Thời lượng phải lớn hơn 0'),
	content: z.string().min(1, 'Nội dung bài học là bắt buộc'),
	position: z.number().min(0),
	resources: z.array(resourceSchema),
	exercises: z.array(exerciseSchema),
});

// Define a Module schema
const moduleSchema = z.object({
	title: z.string().min(1, 'Tiêu đề module là bắt buộc'),
	durationInMinutes: z.number().optional(),
	position: z.number().min(0),
	lessons: z.array(lessonSchema).min(1, 'Module phải có ít nhất một bài học'),
});

// Define the course form schema
const courseFormSchema = z.object({
	title: z.string().min(3, 'Tiêu đề khóa học phải có ít nhất 3 kí tự'),
	description: z.string().min(10, 'Mô tả khóa học phải có ít nhất 10 kí tự'),
	levelId: z.number({
		required_error: 'Vui lòng chọn cấp độ khóa học',
		invalid_type_error: 'Cấp độ khóa học là bắt buộc',
	}),
	courseOverview: z.string().min(10, 'Tổng quan khóa học phải có ít nhất 10 kí tự'),
	courseContent: z.string().min(10, 'Nội dung khóa học phải có ít nhất 10 kí tự'),
	price: z.number().min(0, 'Giá khóa học không được âm'),
	thumbnailUrl: z.string().min(1, 'Hình thu nhỏ khóa học là bắt buộc'),
	includesDescription: z.string().min(10, 'Mô tả nội dung bao gồm phải có ít nhất 10 kí tự'),
	modules: z.array(moduleSchema).min(1, 'Khóa học phải có ít nhất một module'),
});

// Extract type from Zod schema
type CourseFormValues = z.infer<typeof courseFormSchema>;

// Define Level interface
interface Level {
	id: number;
	name: string;
	description?: string;
}

// For compatibility with return type of API
interface CreateCourseResponse {
	id: number;
	title: string;
	description: string;
	levelId: number;
	level?: Level;
	courseOverview: string;
	courseContent: string;
	price: number;
	thumbnailUrl: string;
	includesDescription: string;
	modules: Array<{
		title: string;
		position: number;
		durationInMinutes: number;
		lessons: Array<{
			title: string;
			description: string;
			videoUrl: string;
			durationInMinutes: number;
			content: string;
			position: number;
			resources: Array<{
				title: string;
				description: string;
				fileUrl: string;
				fileType: string;
			}>;
			exercises: Array<{
				title: string;
				description: string;
				type: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK' | 'MATCHING';
				questions: Array<{
					content: string;
					hint?: string;
					correctAnswer?: string;
					answerExplanation: string;
					points: number;
					options: Array<{
						content: string;
						correct: boolean;
					}>;
				}>;
			}>;
		}>;
	}>;
	status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
	createdAt?: string;
	updatedAt?: string;
}

const CreateCourse: React.FC = () => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<string>('basic-info');
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
	const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState<boolean>(false);
	const [uploadingThumbnail, setUploadingThumbnail] = useState<boolean>(false);
	const [currentUploadTasks, setCurrentUploadTasks] = useState<Record<string, boolean>>({});
	const [imagePreview, setImagePreview] = useState<string>('');

	// Get all levels
	const { data: levels, isLoading: isLoadingLevels } = useQuery<any>({
		queryKey: ['levels'],
		queryFn: () => LevelsService.getLevels(),
	});

	// Form setup with React Hook Form and Zod validation
	const methods = useForm<any>({
		resolver: zodResolver(courseFormSchema),
		defaultValues: {
			title: '',
			description: '',
			levelId: undefined as unknown as number, // Type assertion to handle undefined during initialization
			courseOverview: '',
			courseContent: '',
			price: 0,
			thumbnailUrl: '',
			includesDescription: '',
			modules: [
				{
					title: 'Module 1',
					position: 0,
					durationInMinutes: 0,
					lessons: [
						{
							title: 'Bài học 1',
							description: '',
							videoUrl: '',
							durationInMinutes: 0,
							content: '',
							position: 0,
							resources: [],
							exercises: [],
						},
					],
				},
			],
		},
	});

	// Define the mutation for creating a course
	const createCourseMutation = useMutation<any>({
		mutationFn: (data: any) => {
			// Process data to ensure types match API requirements
			const preparedData = {
				...data,
				modules: data.modules.map((module: any) => ({
					...module,
					durationInMinutes: module.durationInMinutes || 0, // Ensure durationInMinutes is always defined
					lessons: module.lessons.map((lesson: any) => ({
						...lesson,
						exercises: lesson.exercises.map((exercise: any) => ({
							...exercise,
							questions: exercise.questions.map((question: any) => ({
								...question,
								options: question.options.map((option: any) => ({
									...option,
									correct: option.correct === undefined ? false : option.correct, // Ensure correct is always boolean
								})),
							})),
						})),
					})),
				})),
			};

			return TutorCourseService.createCourse(preparedData);
		},
		onSuccess: (response) => {
			toast.success('Khóa học đã được tạo thành công!', {
				style: { background: '#58CC02', color: 'white' },
			});
			// Navigate to the course list page
			router.push('/tutor/course');
		},
		onError: (error) => {
			toast.error('Tạo khóa học thất bại. Vui lòng thử lại.', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			console.error('Error creating course:', error);
		},
	});

	// Submit handler
	const onSubmit: any = (data: any) => {
		// Calculate total duration from all lessons
		data.modules.forEach((module: any) => {
			module.durationInMinutes = module.lessons.reduce(
				(sum: any, lesson: any) => sum + (lesson.durationInMinutes || 0),
				0
			);
		});

		// Submit the course
		createCourseMutation.mutate(data);
	};

	// Save as draft handler
	const saveDraft = () => {
		methods.handleSubmit(onSubmit)();
	};

	// Handle navigation between tabs
	const navigateToTab = (tab: string) => {
		setActiveTab(tab);
	};

	// Format time duration for display
	const formatDuration = (minutes: number): string => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	};

	// Render loading skeleton
	if (isLoadingLevels) {
		return (
			<div className='p-6 max-w-7xl mx-auto'>
				<Skeleton className='h-12 w-1/3 mb-6' />
				<div className='space-y-6'>
					<Skeleton className='h-64 w-full rounded-lg' />
					<div className='grid grid-cols-2 gap-6'>
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
					</div>
					<Skeleton className='h-32 w-full' />
				</div>
			</div>
		);
	}

	// Configure sidebar items
	const sidebarItems = [
		{ id: 'basic-info', label: 'Thông tin cơ bản', icon: <Pencil className='h-4 w-4' /> },
		{ id: 'content', label: 'Nội dung khóa học', icon: <BookCopy className='h-4 w-4' /> },
		{ id: 'modules', label: 'Các module & bài học', icon: <LayoutGrid className='h-4 w-4' /> },
		{ id: 'pricing', label: 'Định giá khóa học', icon: <Star className='h-4 w-4' /> },
		{ id: 'preview', label: 'Xem trước & đăng tải', icon: <Eye className='h-4 w-4' /> },
	];

	return (
		<div>
			{/* Header */}
			<div className='bg-white border-b border-gray-200 sticky top-0 z-10'>
				<div className='w-full py-4 flex justify-between items-center'>
					<div className='flex items-center space-x-4'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => router.push('/tutor/courses')}
							className='text-gray-600 hover:text-emerald-600'
						>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Quay lại
						</Button>
						<h1 className='text-xl font-bold text-emerald-700'>Tạo Khóa Học Mới</h1>
					</div>

					<div className='flex items-center space-x-3'>
						<Button variant='secondary' onClick={saveDraft} disabled={createCourseMutation.isPending}>
							{createCourseMutation.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Đang lưu...
								</>
							) : (
								<>
									<Save className='mr-2 h-4 w-4' />
									Lưu bản nháp
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			<FormProvider {...methods}>
				<div className='flex flex-1 w-full py-8'>
					{/* Sidebar navigation */}
					<Sidebar
						sidebarOpen={sidebarOpen}
						setSidebarOpen={setSidebarOpen}
						sidebarItems={sidebarItems}
						activeTab={activeTab}
						navigateToTab={navigateToTab}
					/>

					{/* Main content area */}
					<div className='flex-1 relative'>
						<form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-8'>
							{/* Basic Information */}
							{activeTab === 'basic-info' && (
								<BasicInfoTab
									form={methods as any} // Type assertion to avoid type conflicts
									uploadingThumbnail={uploadingThumbnail}
									setUploadingThumbnail={setUploadingThumbnail}
									imagePreview={imagePreview}
									setImagePreview={setImagePreview}
									navigateToTab={navigateToTab}
									router={router}
									levels={levels}
								/>
							)}

							{/* Course Content */}
							{activeTab === 'content' && (
								<CourseContentTab
									form={methods as any} // Type assertion to avoid type conflicts
									navigateToTab={navigateToTab}
								/>
							)}

							{/* Modules and Lessons */}
							{activeTab === 'modules' && (
								<ModulesTab
									form={methods as any} // Type assertion to avoid type conflicts
									navigateToTab={navigateToTab}
									currentUploadTasks={currentUploadTasks}
									setCurrentUploadTasks={setCurrentUploadTasks}
								/>
							)}

							{/* Pricing */}
							{activeTab === 'pricing' && (
								<PricingTab
									form={methods as any} // Type assertion to avoid type conflicts
									navigateToTab={navigateToTab}
								/>
							)}

							{/* Preview */}
							{activeTab === 'preview' && (
								<PreviewTab
									form={methods as any} // Type assertion to avoid type conflicts
									navigateToTab={navigateToTab}
									formatDuration={formatDuration}
									saveDraft={saveDraft}
									createCourseMutation={createCourseMutation}
									setIsSubmitConfirmOpen={setIsSubmitConfirmOpen}
									levels={levels}
								/>
							)}
						</form>
					</div>
				</div>
			</FormProvider>

			{/* Submit Confirmation Dialog */}
			<AlertDialog open={isSubmitConfirmOpen} onOpenChange={setIsSubmitConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Gửi khóa học để phê duyệt?</AlertDialogTitle>
						<AlertDialogDescription>
							Khóa học của bạn sẽ được gửi đến quản trị viên để xem xét. Sau khi được phê duyệt, khóa học
							sẽ được đăng tải và hiển thị cho học viên.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								setIsSubmitConfirmOpen(false);
								methods.handleSubmit(onSubmit)();
							}}
							className='bg-emerald-600 hover:bg-emerald-700'
						>
							Xác nhận
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default CreateCourse;
