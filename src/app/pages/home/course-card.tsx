'use client';
import Image from 'next/image';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, Book, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/utils';

interface CourseCardProps {
	course: any;
	index: number;
	dictionary: any;
}

const CourseCard = ({ course, index, dictionary }: CourseCardProps) => {
	const pathname = usePathname();
	const currentLocale = pathname.split('/')[1] || 'vi';

	// Animation variants
	const cardVariants = {
		hidden: { opacity: 0, y: 50 },
		visible: (i: number) => ({
			opacity: 1,
			y: 0,
			transition: {
				delay: i * 0.1,
				duration: 0.5,
				ease: 'easeOut',
			},
		}),
	};

	return (
		<motion.div
			className='bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20'
			variants={cardVariants}
			initial='hidden'
			animate='visible'
			custom={index}
			whileHover={{ scale: 1.03, y: -5 }}
			whileTap={{ scale: 0.98 }}
		>
			<div className='relative h-52 overflow-hidden group'>
				<Image
					src={course.thumbnailUrl || '/images/course-placeholder.jpg'}
					alt={course.title}
					fill
					className='object-cover transition-transform duration-500 group-hover:scale-110'
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'></div>
				<Badge
					variant='secondary'
					className='absolute top-3 right-3 bg-primary text-white font-bold border-none'
				>
					{course.level?.name}
				</Badge>
			</div>

			<div className='p-6 flex-1 flex flex-col'>
				<h3 className='text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-primary transition-colors'>
					{course.title}
				</h3>
				<p className='text-gray-600 text-sm mb-4 line-clamp-2'>{course.description}</p>

				<div className='flex items-center mb-4'>
					<div className='w-10 h-10 relative rounded-full overflow-hidden mr-3 border-2 border-primary/20'>
						<Image
							src={course.tutor?.avatarUrl || '/images/avatar-placeholder.png'}
							alt={course.tutor?.fullName || 'Tutor'}
							fill
							className='object-cover'
						/>
					</div>
					<span className='text-gray-700 font-medium'>{course.tutor?.fullName}</span>
				</div>

				<div className='flex flex-wrap gap-3 text-sm text-gray-500 mb-5'>
					<div className='flex items-center px-3 py-1.5 bg-gray-50 rounded-full'>
						<Clock className='h-4 w-4 mr-1.5 text-primary' />
						<span>{formatDuration(course.durationInMinutes, dictionary)}</span>
					</div>
					<div className='flex items-center px-3 py-1.5 bg-gray-50 rounded-full'>
						<Book className='h-4 w-4 mr-1.5 text-primary' />
						<span>
							{course.lessonCount} {dictionary.courses.lessons}
						</span>
					</div>
					{course.rating && (
						<div className='flex items-center px-3 py-1.5 bg-gray-50 rounded-full'>
							<Star className='h-4 w-4 mr-1.5 text-yellow-500 fill-yellow-500' />
							<span>{course.rating}/5</span>
						</div>
					)}
				</div>

				<div className='mt-auto flex justify-between items-center pt-4 border-t border-gray-100'>
					<span className='text-lg font-bold text-primary'>
						{new Intl.NumberFormat(currentLocale === 'jp' ? 'ja-JP' : 'vi-VN', {
							style: 'currency',
							currency: currentLocale === 'jp' ? 'JPY' : 'VND',
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						}).format(course.price)}
					</span>
					<Link href={`/${currentLocale}/courses/${course.id}`}>
						<button className='px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors'>
							{dictionary.courses.viewDetails}
						</button>
					</Link>
				</div>
			</div>
		</motion.div>
	);
};

export default CourseCard;
