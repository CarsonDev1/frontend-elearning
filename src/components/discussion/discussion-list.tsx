'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Discussion } from '@/services/discussion-service';
import DiscussionService from '@/services/discussion-service';
import { formatDistanceToNow } from 'date-fns';
import { vi, ja } from 'date-fns/locale';
import { MessageCircle, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import NewDiscussionModal from './new-discussion-modal';

interface DiscussionListProps {
	lessonId: number;
	lang: string;
	dict: any;
}

const DiscussionList: React.FC<DiscussionListProps> = ({ lessonId, lang, dict }) => {
	const [page, setPage] = useState(0);
	const [searchTerm, setSearchTerm] = useState('');
	const [isNewDiscussionModalOpen, setIsNewDiscussionModalOpen] = useState(false);

	// Fetch discussions for the lesson
	const {
		data: discussions,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ['discussions', lessonId, page],
		queryFn: () => DiscussionService.getDiscussionsByLesson(lessonId, page),
	});

	// Format date based on language
	const formatDate = (date: string) => {
		try {
			const dateObj = new Date(date);
			return formatDistanceToNow(dateObj, {
				addSuffix: true,
				locale: lang === 'vi' ? vi : ja,
			});
		} catch (error) {
			return date;
		}
	};

	// Filter discussions by search term
	const filteredDiscussions = discussions?.content.filter(
		(discussion) =>
			discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			discussion.content.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Handle create new discussion
	const handleCreateDiscussion = async () => {
		setIsNewDiscussionModalOpen(true);
	};

	// Handle discussion created
	const handleDiscussionCreated = () => {
		refetch();
		setIsNewDiscussionModalOpen(false);
	};

	if (isLoading) {
		return (
			<div className='space-y-4'>
				<div className='flex justify-between items-center'>
					<Skeleton className='h-10 w-40' />
					<Skeleton className='h-10 w-32' />
				</div>
				<div className='space-y-4'>
					{[...Array(3)].map((_, i) => (
						<div key={i} className='border rounded-lg p-4'>
							<Skeleton className='h-6 w-3/4 mb-2' />
							<Skeleton className='h-4 w-1/2 mb-4' />
							<Skeleton className='h-12 w-full' />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return <div className='p-4 bg-red-50 text-red-700 rounded-md'>{dict.errors.failedToLoadDiscussions}</div>;
	}

	return (
		<div className='space-y-4'>
			<div className='flex justify-between items-center'>
				<h3 className='text-lg font-semibold'>
					{dict.learning.discussions} ({discussions?.totalElements || 0})
				</h3>
				<Button onClick={handleCreateDiscussion} className='flex items-center gap-1'>
					<Plus size={16} />
					{dict.learning.newDiscussion}
				</Button>
			</div>

			<div className='relative mb-4'>
				<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={18} />
				<Input
					type='text'
					placeholder={dict.learning.searchDiscussions}
					className='pl-10'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			{filteredDiscussions && filteredDiscussions.length > 0 ? (
				<div className='space-y-4'>
					{filteredDiscussions.map((discussion) => (
						<Link
							href={`/${lang}/learning/discussions/${discussion.id}`}
							key={discussion.id}
							className='block border rounded-lg p-4 hover:border-primary hover:bg-gray-50 transition-colors'
						>
							<div className='flex justify-between items-start'>
								<h4 className='font-medium text-lg'>{discussion.title}</h4>
								<span className='text-sm text-gray-500'>{formatDate(discussion.createdAt)}</span>
							</div>
							<p className='text-gray-600 mt-2 line-clamp-2'>{discussion.content}</p>
							<div className='flex items-center mt-3 text-sm text-gray-500'>
								<div className='flex items-center'>
									{discussion.userAvatar ? (
										<img
											src={discussion.userAvatar}
											alt={discussion.userName}
											className='w-5 h-5 rounded-full mr-2'
										/>
									) : (
										<div className='w-5 h-5 bg-gray-200 rounded-full mr-2'></div>
									)}
									<span>{discussion.userName}</span>
								</div>
								<div className='flex items-center ml-4'>
									<MessageCircle size={16} className='mr-1' />
									<span>{discussion.commentCount}</span>
								</div>
							</div>
						</Link>
					))}
				</div>
			) : (
				<div className='text-center py-8 border rounded-lg'>
					<MessageCircle className='mx-auto h-12 w-12 text-gray-300' />
					<p className='mt-2 text-gray-500'>{dict.learning.noDiscussions}</p>
					<Button onClick={handleCreateDiscussion} variant='superOutline' className='mt-4'>
						{dict.learning.startFirstDiscussion}
					</Button>
				</div>
			)}

			{discussions && discussions.totalPages > 1 && (
				<div className='flex justify-center mt-6 gap-2'>
					<Button variant='superOutline' onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
						{dict.common.previous}
					</Button>
					<span className='py-2 px-4 border rounded-md'>
						{page + 1} / {discussions.totalPages}
					</span>
					<Button
						variant='superOutline'
						onClick={() => setPage(Math.min(discussions.totalPages - 1, page + 1))}
						disabled={page >= discussions.totalPages - 1}
					>
						{dict.common.next}
					</Button>
				</div>
			)}

			<NewDiscussionModal
				isOpen={isNewDiscussionModalOpen}
				onClose={() => setIsNewDiscussionModalOpen(false)}
				onDiscussionCreated={handleDiscussionCreated}
				lessonId={lessonId}
				dict={dict}
			/>
		</div>
	);
};

export default DiscussionList;
