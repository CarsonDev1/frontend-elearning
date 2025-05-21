'use client';
import Image from 'next/image';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, Book, Package, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/utils';

interface ComboCardProps {
	combo: any;
	index: number;
	dictionary: any;
}

const ComboCard = ({ combo, index, dictionary }: ComboCardProps) => {
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

	// Calculate total duration and lesson count if available
	const totalDuration =
		combo.courses?.reduce((acc: number, course: any) => acc + (course.durationInMinutes || 0), 0) || 0;
	const totalLessons = combo.courses?.reduce((acc: number, course: any) => acc + (course.lessonCount || 0), 0) || 0;

	// Calculate discount percentage if original price is available
	const discountPercentage =
		combo.originalPrice && combo.discountPrice
			? Math.round(((combo.originalPrice - combo.discountPrice) / combo.originalPrice) * 100)
			: 0;

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
					src={combo.thumbnailUrl || '/images/combo-placeholder.jpg'}
					alt={combo.title}
					fill
					className='object-cover transition-transform duration-500 group-hover:scale-110'
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'></div>
				{discountPercentage > 0 && (
					<Badge
						variant='secondary'
						className='absolute top-3 right-3 bg-red-500 text-white font-bold border-none'
					>
						{discountPercentage}% OFF
					</Badge>
				)}
				<Badge
					variant='secondary'
					className='absolute top-3 left-3 bg-primary text-white font-bold border-none'
				>
					{dictionary.combos?.comboLabel || 'Combo'}
				</Badge>
			</div>

			<div className='p-6 flex-1 flex flex-col'>
				<h3 className='text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-primary transition-colors'>
					{combo.title}
				</h3>
				<p className='text-gray-600 text-sm mb-4 line-clamp-2'>{combo.description}</p>

				{combo.courses && combo.courses.length > 0 && (
					<div className='mb-4 bg-gray-50 p-3 rounded-lg'>
						<div className='flex items-center mb-2'>
							<Package className='h-4 w-4 mr-2 text-primary' />
							<span className='text-gray-700 font-medium'>
								{dictionary.combos?.includedCourses || 'Included Courses'}:
							</span>
						</div>
						<ul className='text-sm text-gray-600 pl-6 list-disc'>
							{combo.courses.slice(0, 3).map((course: any) => (
								<li key={course.id} className='line-clamp-1'>
									{course.title}
								</li>
							))}
							{combo.courses.length > 3 && (
								<li className='text-primary font-medium'>
									+{combo.courses.length - 3} {dictionary.combos?.moreCourses || 'more courses'}
								</li>
							)}
						</ul>
					</div>
				)}

				<div className='flex flex-wrap gap-3 text-sm text-gray-500 mb-5'>
					{totalDuration > 0 && (
						<div className='flex items-center px-3 py-1.5 bg-gray-50 rounded-full'>
							<Clock className='h-4 w-4 mr-1.5 text-primary' />
							<span>{formatDuration(totalDuration, dictionary)}</span>
						</div>
					)}
					{totalLessons > 0 && (
						<div className='flex items-center px-3 py-1.5 bg-gray-50 rounded-full'>
							<Book className='h-4 w-4 mr-1.5 text-primary' />
							<span>
								{totalLessons} {dictionary.courses.lessons}
							</span>
						</div>
					)}
					{combo.savingsPercentage && (
						<div className='flex items-center px-3 py-1.5 bg-green-50 rounded-full text-green-600'>
							<Tag className='h-4 w-4 mr-1.5' />
							<span>
								{dictionary.combos?.savingsLabel || 'Save'} {combo.savingsPercentage}%
							</span>
						</div>
					)}
				</div>

				<div className='mt-auto flex justify-between items-center pt-4 border-t border-gray-100'>
					<div className='flex flex-col'>
						<span className='text-lg font-bold text-primary'>
							{new Intl.NumberFormat(currentLocale === 'jp' ? 'ja-JP' : 'vi-VN', {
								style: 'currency',
								currency: currentLocale === 'jp' ? 'JPY' : 'VND',
								minimumFractionDigits: 0,
								maximumFractionDigits: 0,
							}).format(combo.discountPrice || combo.originalPrice)}
						</span>
						{combo.discountPrice && combo.originalPrice && (
							<span className='text-sm text-gray-500 line-through'>
								{new Intl.NumberFormat(currentLocale === 'jp' ? 'ja-JP' : 'vi-VN', {
									style: 'currency',
									currency: currentLocale === 'jp' ? 'JPY' : 'VND',
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
								}).format(combo.originalPrice)}
							</span>
						)}
					</div>
					<Link href={`/${currentLocale}/combos/${combo.id}`}>
						<button className='px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors'>
							{dictionary.combos?.viewDetails || dictionary.courses.viewDetails}
						</button>
					</Link>
				</div>
			</div>
		</motion.div>
	);
};

export default ComboCard;
