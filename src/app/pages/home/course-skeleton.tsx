import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const CourseCardSkeleton = () => {
	return (
		<div className='bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100'>
			<Skeleton className='h-52 w-full' />
			<div className='p-6 flex-1 flex flex-col'>
				<Skeleton className='h-7 w-4/5 mb-3' />
				<Skeleton className='h-4 w-full mb-2' />
				<Skeleton className='h-4 w-3/4 mb-4' />

				<div className='flex items-center mb-4'>
					<Skeleton className='h-10 w-10 rounded-full mr-3' />
					<Skeleton className='h-5 w-32' />
				</div>

				<div className='flex flex-wrap gap-3 mb-5'>
					<Skeleton className='h-8 w-28 rounded-full' />
					<Skeleton className='h-8 w-24 rounded-full' />
					<Skeleton className='h-8 w-20 rounded-full' />
				</div>

				<div className='mt-auto flex justify-between items-center pt-4 border-t border-gray-100'>
					<Skeleton className='h-6 w-24' />
					<Skeleton className='h-10 w-32 rounded-lg' />
				</div>
			</div>
		</div>
	);
};

export default CourseCardSkeleton;
