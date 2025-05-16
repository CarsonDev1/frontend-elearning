'use client';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CourseFormValues } from '@/schemas/course-schema';

interface CourseContentTabProps {
	form: UseFormReturn<CourseFormValues>;
	navigateToTab: (tab: string) => void;
}

const CourseContentTab: React.FC<CourseContentTabProps> = ({ form, navigateToTab }) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-xl text-emerald-700'>Nội dung khóa học</CardTitle>
				<CardDescription>Mô tả chi tiết về nội dung khóa học của bạn</CardDescription>
			</CardHeader>
			<CardContent className='space-y-6'>
				{/* Course Overview */}
				<FormField
					control={form.control}
					name='courseOverview'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tổng quan khóa học</FormLabel>
							<FormControl>
								<Textarea
									placeholder='Tổng quan về những gì học viên sẽ học được'
									className='min-h-[150px]'
									{...field}
								/>
							</FormControl>
							<FormDescription>
								Mô tả tổng quan về những kiến thức và kỹ năng mà học viên sẽ đạt được
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Course Content */}
				<FormField
					control={form.control}
					name='courseContent'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nội dung chi tiết</FormLabel>
							<FormControl>
								<Textarea
									placeholder='Mô tả chi tiết nội dung khóa học'
									className='min-h-[200px]'
									{...field}
								/>
							</FormControl>
							<FormDescription>
								Cung cấp chi tiết về các chủ đề và kỹ năng mà khóa học của bạn bao gồm
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Includes Description */}
				<FormField
					control={form.control}
					name='includesDescription'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Khóa học bao gồm</FormLabel>
							<FormControl>
								<Textarea
									placeholder='Liệt kê những gì được bao gồm trong khóa học'
									className='min-h-[120px]'
									{...field}
								/>
							</FormControl>
							<FormDescription>
								Liệt kê các tài nguyên và tiện ích mà học viên sẽ được tiếp cận (ví dụ: video, tài liệu,
								bài tập, hỗ trợ...)
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
			<CardFooter className='flex justify-between'>
				<Button type='button' variant='superOutline' onClick={() => navigateToTab('basic-info')}>
					Quay lại
				</Button>
				<Button type='button' onClick={() => navigateToTab('modules')} variant='primary'>
					Tiếp theo
				</Button>
			</CardFooter>
		</Card>
	);
};

export default CourseContentTab;
