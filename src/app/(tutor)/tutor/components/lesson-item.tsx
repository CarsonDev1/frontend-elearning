import React, { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, Video, X, Loader2, Film, FileText, FileUp, HelpCircle, FileQuestion } from 'lucide-react';
import FileUploadService from '@/services/file-upload-service';
import { toast } from 'sonner';
import ResourceItem from '@/app/(tutor)/tutor/components/resource-item';
import ExerciseItem from '@/app/(tutor)/tutor/components/exercise-item';
import { Progress } from '@/components/ui/progress';

const LessonItem = ({ form, moduleIndex, lessonIndex, currentUploadTasks, setCurrentUploadTasks }: any) => {
	// Setup field arrays for resources and exercises
	const resourcesArray: any = useFieldArray({
		control: form.control,
		name: `modules.${moduleIndex}.lessons.${lessonIndex}.resources`,
	});

	const exercisesArray: any = useFieldArray({
		control: form.control,
		name: `modules.${moduleIndex}.lessons.${lessonIndex}.exercises`,
	});

	// Get the lessons array for this module to handle removal
	const { remove: removeLessonAtIndex } = useFieldArray({
		control: form.control,
		name: `modules.${moduleIndex}.lessons`,
	});

	// Add upload progress state
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);

	// Handle video upload for lessons
	const handleVideoUpload = async (event: any) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Check file type
		const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
		if (!allowedTypes.includes(file.type)) {
			toast.error('Chỉ chấp nhận file video (MP4, WEBM, OGG)', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			return;
		}

		// Check file size (100MB max)
		if (file.size > 100 * 1024 * 1024) {
			toast.error('Kích thước video không được vượt quá 100MB', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			return;
		}

		try {
			// Start upload tracking
			const taskId = `video-${moduleIndex}-${lessonIndex}`;
			setCurrentUploadTasks((prev: any) => ({ ...prev, [taskId]: true }));
			setIsUploading(true);
			setUploadProgress(0);

			// Simulate upload progress - in a real implementation,
			// this would be replaced with actual progress from your upload service
			const progressInterval = setInterval(() => {
				setUploadProgress((prevProgress) => {
					// If we're at 90%, wait for the actual upload to complete
					if (prevProgress >= 90) {
						return prevProgress;
					}
					return prevProgress + Math.floor(Math.random() * 5) + 1;
				});
			}, 300);

			// Upload to server
			const response = await FileUploadService.uploadVideo(file);

			// Clear interval and set to 100% when upload is complete
			clearInterval(progressInterval);
			setUploadProgress(100);

			// Short delay to show 100% before resetting
			setTimeout(() => {
				setIsUploading(false);
			}, 500);

			form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`, response.url);
			form.trigger(`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`);

			toast.success('Tải lên video thành công!', {
				style: { background: '#58CC02', color: 'white' },
			});
		} catch (error) {
			// If there's an error, clear the interval and reset progress
			setIsUploading(false);
			console.error('Error uploading video:', error);
			toast.error('Tải lên video thất bại. Vui lòng thử lại.', {
				style: { background: '#FF4B4B', color: 'white' },
			});
		} finally {
			// Remove upload task
			const taskId = `video-${moduleIndex}-${lessonIndex}`;
			setCurrentUploadTasks((prev: any) => {
				const newTasks = { ...prev };
				delete newTasks[taskId];
				return newTasks;
			});
		}
	};

	// Add a new resource to a lesson
	const addResource = () => {
		resourcesArray.append({
			title: '',
			description: '',
			fileUrl: '',
			fileType: '',
		});
	};

	// Add a new exercise to a lesson
	const addExercise = () => {
		exercisesArray.append({
			title: '',
			description: '',
			type: 'MULTIPLE_CHOICE',
			questions: [
				{
					content: '',
					hint: '',
					correctAnswer: '',
					answerExplanation: '',
					points: 1,
					options: [
						{ content: '', correct: true },
						{ content: '', correct: false },
					],
				},
			],
		});
	};

	// Remove this lesson from the module - FIXED to avoid using hooks inside functions
	const removeLesson = () => {
		// Use the pre-defined remove function
		removeLessonAtIndex(lessonIndex);
	};

	return (
		<div className='border border-gray-200 rounded-lg p-4'>
			<Accordion type='single' collapsible className='w-full'>
				<AccordionItem value='lesson'>
					<AccordionTrigger className='hover:no-underline py-2'>
						<div className='flex items-center space-x-2 text-left'>
							<span className='text-gray-500'>Bài {lessonIndex + 1}:</span>
							<span className='font-medium text-emerald-700'>
								{form.watch(`modules.${moduleIndex}.lessons.${lessonIndex}.title`) || 'Bài học mới'}
							</span>
						</div>
					</AccordionTrigger>
					<AccordionContent className='pt-4 pb-2'>
						<div className='space-y-6 px-1'>
							{/* Lesson Title */}
							<FormField
								control={form.control}
								name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tiêu đề bài học</FormLabel>
										<FormControl>
											<Input placeholder='Nhập tiêu đề bài học' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Lesson Description */}
							<FormField
								control={form.control}
								name={`modules.${moduleIndex}.lessons.${lessonIndex}.description`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mô tả bài học</FormLabel>
										<FormControl>
											<Textarea placeholder='Mô tả ngắn gọn về bài học' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Lesson Duration */}
							<FormField
								control={form.control}
								name={`modules.${moduleIndex}.lessons.${lessonIndex}.durationInMinutes`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Thời lượng (phút)</FormLabel>
										<FormControl>
											<Input
												type='number'
												min='1'
												placeholder='Nhập thời lượng bài học (phút)'
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Video Upload */}
							<FormField
								control={form.control}
								name={`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Video bài học</FormLabel>
										<div className='flex flex-col space-y-3'>
											<FormControl>
												<Input type='hidden' {...field} />
											</FormControl>

											{field.value && (
												<div className='flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200'>
													<Video className='h-5 w-5 text-emerald-600' />
													<span className='text-sm text-gray-700 flex-1 truncate'>
														{field.value.split('/').pop()}
													</span>
													<Button
														type='button'
														variant='ghost'
														size='sm'
														onClick={() => {
															form.setValue(
																`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`,
																''
															);
															form.trigger(
																`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`
															);
														}}
														className='text-gray-500 hover:text-red-500 hover:bg-red-50 p-1 h-8 w-8'
													>
														<X className='h-4 w-4' />
													</Button>
												</div>
											)}

											<div>
												<Button
													type='button'
													variant='superOutline'
													onClick={() =>
														document
															.getElementById(
																`video-upload-${moduleIndex}-${lessonIndex}`
															)
															?.click()
													}
													disabled={
														isUploading ||
														!!currentUploadTasks[`video-${moduleIndex}-${lessonIndex}`]
													}
													className='w-fit'
												>
													{isUploading ? (
														<>
															<Loader2 className='mr-2 h-4 w-4 animate-spin' />
															Đang tải lên...
														</>
													) : (
														<>
															<Film className='mr-2 h-4 w-4' />
															{field.value ? 'Thay đổi video' : 'Tải lên video'}
														</>
													)}
												</Button>
												<Input
													id={`video-upload-${moduleIndex}-${lessonIndex}`}
													type='file'
													accept='video/*'
													className='hidden'
													onChange={handleVideoUpload}
													disabled={
														isUploading ||
														!!currentUploadTasks[`video-${moduleIndex}-${lessonIndex}`]
													}
												/>
												<p className='text-xs text-gray-500 mt-1'>
													Định dạng: MP4, WEBM, OGG. Tối đa 100MB.
												</p>
											</div>

											{/* Upload Progress Bar */}
											{isUploading && (
												<div className='w-full space-y-2'>
													<div className='flex justify-between text-xs'>
														<span>Đang tải lên...</span>
														<span>{uploadProgress}%</span>
													</div>
													<Progress value={uploadProgress} className='h-2' />
												</div>
											)}
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Lesson Content */}
							<FormField
								control={form.control}
								name={`modules.${moduleIndex}.lessons.${lessonIndex}.content`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nội dung bài học</FormLabel>
										<FormControl>
											<Textarea
												placeholder='Nội dung chi tiết của bài học'
												className='min-h-[200px]'
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Cung cấp nội dung chi tiết của bài học, có thể sử dụng Markdown
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Resources */}
							<div className='space-y-4'>
								<div className='flex items-center justify-between'>
									<Label className='text-base font-medium'>Tài liệu bổ sung</Label>
									<Button type='button' variant='secondary' size='sm' onClick={addResource}>
										<Plus className='h-4 w-4 mr-1' />
										Thêm tài liệu
									</Button>
								</div>

								{resourcesArray.fields.length === 0 ? (
									<div className='text-center py-4 border border-dashed border-gray-200 rounded-md'>
										<FileText className='h-8 w-8 text-gray-300 mx-auto mb-2' />
										<p className='text-sm text-gray-500'>Chưa có tài liệu bổ sung</p>
									</div>
								) : (
									<div className='space-y-4'>
										{resourcesArray.fields.map((resource: any, resourceIndex: any) => (
											<ResourceItem
												key={resource.id}
												form={form}
												moduleIndex={moduleIndex}
												lessonIndex={lessonIndex}
												resourceIndex={resourceIndex}
												resourcesArray={resourcesArray}
												currentUploadTasks={currentUploadTasks}
												setCurrentUploadTasks={setCurrentUploadTasks}
											/>
										))}
									</div>
								)}
							</div>

							{/* Exercises */}
							<div className='space-y-4'>
								<div className='flex items-center justify-between'>
									<Label className='text-base font-medium'>Bài tập</Label>
									<Button type='button' variant='secondary' size='sm' onClick={addExercise}>
										<Plus className='h-4 w-4 mr-1' />
										Thêm bài tập
									</Button>
								</div>

								{exercisesArray.fields.length === 0 ? (
									<div className='text-center py-4 border border-dashed border-gray-200 rounded-md'>
										<FileQuestion className='h-8 w-8 text-gray-300 mx-auto mb-2' />
										<p className='text-sm text-gray-500'>Chưa có bài tập</p>
									</div>
								) : (
									<div className='space-y-4'>
										{exercisesArray.fields.map((exercise: any, exerciseIndex: any) => (
											<ExerciseItem
												key={exercise.id}
												form={form}
												moduleIndex={moduleIndex}
												lessonIndex={lessonIndex}
												exerciseIndex={exerciseIndex}
												exercisesArray={exercisesArray}
											/>
										))}
									</div>
								)}
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<div className='flex justify-end mt-2'>
				{form.watch(`modules.${moduleIndex}.lessons`).length > 1 && (
					<Button type='button' variant='danger' size='sm' onClick={removeLesson}>
						<Trash2 className='h-4 w-4 mr-1' />
						Xóa bài học
					</Button>
				)}
			</div>
		</div>
	);
};

export default LessonItem;
