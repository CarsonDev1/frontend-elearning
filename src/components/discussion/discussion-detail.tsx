'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DiscussionService, { Comment } from '@/services/discussion-service';
import { formatDistanceToNow } from 'date-fns';
import { vi, ja } from 'date-fns/locale';
import { ArrowLeft, Edit, Trash2, Reply, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface DiscussionDetailProps {
	discussionId: number;
	lang: string;
	dict: any;
	currentUserId?: number;
}

const DiscussionDetail: React.FC<DiscussionDetailProps> = ({ discussionId, lang, dict, currentUserId }) => {
	const queryClient = useQueryClient();
	const [newComment, setNewComment] = useState('');
	const [replyToId, setReplyToId] = useState<number | null>(null);
	const [replyContent, setReplyContent] = useState('');
	const [editCommentId, setEditCommentId] = useState<number | null>(null);
	const [editContent, setEditContent] = useState('');
	const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Fetch discussion details
	const {
		data: discussion,
		isLoading: isDiscussionLoading,
		isError: isDiscussionError,
	} = useQuery({
		queryKey: ['discussion', discussionId],
		queryFn: () => DiscussionService.getDiscussionById(discussionId),
	});

	// Fetch comments
	const {
		data: comments,
		isLoading: isCommentsLoading,
		isError: isCommentsError,
	} = useQuery({
		queryKey: ['comments', discussionId],
		queryFn: () => DiscussionService.getCommentsByDiscussion(discussionId),
	});

	// Add comment mutation
	const addCommentMutation = useMutation({
		mutationFn: (data: { discussionId: number; content: string; parentId?: number }) =>
			DiscussionService.addComment(data.discussionId, {
				content: data.content,
				parentId: data.parentId,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', discussionId] });
			queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
			setNewComment('');
			setReplyToId(null);
			setReplyContent('');
		},
		onError: (error: any) => {
			setError(error?.response?.data?.message || dict.errors.failedToAddComment);
		},
	});

	// Update comment mutation
	const updateCommentMutation = useMutation({
		mutationFn: (data: { commentId: number; content: string }) =>
			DiscussionService.updateComment(data.commentId, { content: data.content }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', discussionId] });
			setEditCommentId(null);
			setEditContent('');
		},
		onError: (error: any) => {
			setError(error?.response?.data?.message || dict.errors.failedToUpdateComment);
		},
	});

	// Delete comment mutation
	const deleteCommentMutation = useMutation({
		mutationFn: (commentId: number) => DiscussionService.deleteComment(commentId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', discussionId] });
			queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
			setDeleteCommentId(null);
		},
		onError: (error: any) => {
			setError(error?.response?.data?.message || dict.errors.failedToDeleteComment);
		},
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

	// Handle submit comment
	const handleSubmitComment = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!newComment.trim()) {
			setError(dict.errors.commentRequired);
			return;
		}

		addCommentMutation.mutate({
			discussionId,
			content: newComment.trim(),
		});
	};

	// Handle submit reply
	const handleSubmitReply = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!replyContent.trim() || !replyToId) {
			setError(dict.errors.commentRequired);
			return;
		}

		addCommentMutation.mutate({
			discussionId,
			content: replyContent.trim(),
			parentId: replyToId,
		});
	};

	// Handle edit comment
	const handleEditComment = (comment: Comment) => {
		setEditCommentId(comment.id);
		setEditContent(comment.content);
	};

	// Handle submit edit
	const handleSubmitEdit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!editContent.trim() || !editCommentId) {
			setError(dict.errors.commentRequired);
			return;
		}

		updateCommentMutation.mutate({
			commentId: editCommentId,
			content: editContent.trim(),
		});
	};

	// Handle delete comment
	const handleDeleteComment = (commentId: number) => {
		setDeleteCommentId(commentId);
	};

	// Handle confirm delete
	const handleConfirmDelete = () => {
		if (deleteCommentId) {
			deleteCommentMutation.mutate(deleteCommentId);
		}
	};

	// Check if user can edit/delete a comment
	const canModifyComment = (userId: number) => {
		return currentUserId === userId;
	};

	// Render comment item
	const renderComment = (comment: Comment, isReply = false) => {
		const isEditing = editCommentId === comment.id;

		return (
			<div key={comment.id} className={`border-t py-4 ${isReply ? 'ml-12 border-gray-100' : 'border-gray-200'}`}>
				<div className='flex gap-3'>
					<Avatar className='h-8 w-8'>
						<AvatarImage src={comment.userAvatar} alt={comment.userName} />
						<AvatarFallback>{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
					</Avatar>

					<div className='flex-1'>
						<div className='flex justify-between'>
							<div>
								<span className='font-medium'>{comment.userName}</span>
								<span className='text-xs text-gray-500 ml-2'>{formatDate(comment.createdAt)}</span>
							</div>

							{canModifyComment(comment.userId) && !isEditing && (
								<div className='flex space-x-2'>
									<button
										onClick={() => handleEditComment(comment)}
										className='text-gray-500 hover:text-gray-700'
										aria-label={dict.common.edit}
									>
										<Edit size={16} />
									</button>
									<button
										onClick={() => handleDeleteComment(comment.id)}
										className='text-gray-500 hover:text-red-600'
										aria-label={dict.common.delete}
									>
										<Trash2 size={16} />
									</button>
								</div>
							)}
						</div>

						{isEditing ? (
							<form onSubmit={handleSubmitEdit} className='mt-2'>
								<Textarea
									value={editContent}
									onChange={(e) => setEditContent(e.target.value)}
									rows={3}
									className='mb-2'
									disabled={updateCommentMutation.isPending}
								/>
								<div className='flex justify-end gap-2'>
									<Button
										type='button'
										variant='superOutline'
										size='sm'
										onClick={() => setEditCommentId(null)}
										disabled={updateCommentMutation.isPending}
									>
										{dict.common.cancel}
									</Button>
									<Button type='submit' size='sm' disabled={updateCommentMutation.isPending}>
										{updateCommentMutation.isPending ? (
											<>
												<Loader2 className='mr-2 h-3 w-3 animate-spin' />
												{dict.common.saving}
											</>
										) : (
											dict.common.save
										)}
									</Button>
								</div>
							</form>
						) : (
							<>
								<p className='mt-1 text-gray-700'>{comment.content}</p>

								{!isReply && (
									<button
										onClick={() => {
											setReplyToId(comment.id);
											setReplyContent('');
										}}
										className='mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800'
									>
										<Reply size={14} className='mr-1' />
										{dict.common.reply}
									</button>
								)}

								{replyToId === comment.id && (
									<form onSubmit={handleSubmitReply} className='mt-3'>
										<Textarea
											value={replyContent}
											onChange={(e) => setReplyContent(e.target.value)}
											placeholder={`${dict.learning.replyTo} ${comment.userName}...`}
											rows={2}
											className='mb-2 text-sm'
											disabled={addCommentMutation.isPending}
										/>
										<div className='flex justify-end gap-2'>
											<Button
												type='button'
												variant='superOutline'
												size='sm'
												onClick={() => setReplyToId(null)}
												disabled={addCommentMutation.isPending}
											>
												{dict.common.cancel}
											</Button>
											<Button type='submit' size='sm' disabled={addCommentMutation.isPending}>
												{addCommentMutation.isPending ? (
													<>
														<Loader2 className='mr-2 h-3 w-3 animate-spin' />
														{dict.common.sending}
													</>
												) : (
													dict.common.send
												)}
											</Button>
										</div>
									</form>
								)}
							</>
						)}
					</div>
				</div>

				{/* Render replies */}
				{comment.replies &&
					comment.replies.length > 0 &&
					comment.replies.map((reply) => renderComment(reply, true))}
			</div>
		);
	};

	if (isDiscussionLoading || isCommentsLoading) {
		return (
			<div className='space-y-4'>
				<div className='flex items-center gap-2 mb-6'>
					<Skeleton className='h-8 w-8' />
					<Skeleton className='h-6 w-40' />
				</div>
				<Skeleton className='h-8 w-3/4 mb-2' />
				<Skeleton className='h-4 w-1/2 mb-6' />
				<Skeleton className='h-24 w-full mb-6' />
				<Skeleton className='h-32 w-full' />
			</div>
		);
	}

	if (isDiscussionError || isCommentsError) {
		return <div className='p-4 bg-red-50 text-red-700 rounded-md'>{dict.errors.failedToLoadDiscussion}</div>;
	}

	return (
		<div className='space-y-6'>
			{/* Back button */}
			<div className='mb-6'>
				<Link
					href={`/${lang}/learning/courses/${discussion?.lessonId}`}
					className='flex items-center text-gray-600 hover:text-gray-900'
				>
					<ArrowLeft size={16} className='mr-1' />
					{dict.common.back}
				</Link>
			</div>

			{/* Discussion header */}
			<div>
				<h1 className='text-2xl font-bold mb-2'>{discussion?.title}</h1>
				<div className='flex items-center text-sm text-gray-500 mb-4'>
					<div className='flex items-center'>
						{discussion?.userAvatar ? (
							<img
								src={discussion.userAvatar}
								alt={discussion.userName}
								className='w-5 h-5 rounded-full mr-2'
							/>
						) : (
							<div className='w-5 h-5 bg-gray-200 rounded-full mr-2'></div>
						)}
						<span>{discussion?.userName}</span>
					</div>
					<span className='mx-2'>•</span>
					<span>{formatDate(discussion?.createdAt || '')}</span>
				</div>
				<div className='prose max-w-none mb-8'>
					<p>{discussion?.content}</p>
				</div>
			</div>

			{/* Comments section */}
			<div>
				<h2 className='text-xl font-semibold mb-4'>
					{dict.learning.comments} ({comments?.length || 0})
				</h2>

				{/* Add comment form */}
				<form onSubmit={handleSubmitComment} className='mb-6'>
					{error && <div className='p-3 mb-3 text-sm bg-red-50 text-red-700 rounded-md'>{error}</div>}
					<Textarea
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder={dict.learning.writeComment}
						rows={3}
						className='mb-2'
						disabled={addCommentMutation.isPending}
					/>
					<div className='flex justify-end'>
						<Button type='submit' disabled={addCommentMutation.isPending}>
							{addCommentMutation.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									{dict.common.sending}
								</>
							) : (
								<>
									<Send size={16} className='mr-2' />
									{dict.common.sendComment}
								</>
							)}
						</Button>
					</div>
				</form>

				{/* Comments list */}
				<div className='space-y-0'>
					{comments && comments.length > 0 ? (
						comments.map((comment) => renderComment(comment))
					) : (
						<div className='text-center py-8 border-t border-gray-200'>
							<p className='text-gray-500'>{dict.learning.noComments}</p>
						</div>
					)}
				</div>
			</div>

			{/* Delete confirmation dialog */}
			<AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{dict.common.confirmDelete}</AlertDialogTitle>
						<AlertDialogDescription>{dict.common.deleteCommentConfirmation}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{dict.common.cancel}</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmDelete} className='bg-red-600 hover:bg-red-700'>
							{deleteCommentMutation.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									{dict.common.deleting}
								</>
							) : (
								dict.common.delete
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default DiscussionDetail;
