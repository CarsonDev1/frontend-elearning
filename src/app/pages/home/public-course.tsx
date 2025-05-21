'use client';
import CourseGrid from '@/app/pages/home/course-grid';
import CourseService from '@/services/course-service';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

const PublicCourse = ({ dictionary }: { dictionary: any }) => {
	const [allCourses, setAllCourses] = useState<any[]>([]);

	// Fixed pageSize to 6, no more pagination in home page
	const {
		data: coursesData,
		isLoading,
		isFetching,
	} = useQuery<any>({
		queryKey: ['public-courses', 0, 6], // Always fetch first page with 6 courses
		queryFn: () => CourseService.getPublicCourses(0, 6),
	});

	// Set courses from data
	useEffect(() => {
		if (coursesData?.content && !isLoading) {
			setAllCourses(coursesData.content);
		}
	}, [coursesData, isLoading]);

	return (
		<div className='relative container-lg'>
			<div className='absolute -top-20 left-0'>
				<Image src='/images/decor-public-course.png' width={50} height={50} alt='decor' />
			</div>
			<div className='relative sec-com'>
				<div className='pb-12'>
					<h3 className='text-center text-4xl text-primary font-bold uppercase'>
						{dictionary.courses.onlineCourses}
					</h3>
					<p className='text-center text-gray-600 mt-3 max-w-3xl mx-auto'>{dictionary.courses.description}</p>
				</div>

				<CourseGrid
					courses={allCourses}
					isLoading={isLoading}
					isFetching={isFetching}
					dictionary={dictionary}
					hasMore={coursesData?.last === false}
					loadingMore={false}
				/>
			</div>
		</div>
	);
};

export default PublicCourse;
