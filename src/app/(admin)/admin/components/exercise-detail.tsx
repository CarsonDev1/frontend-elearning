import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const ExerciseDetailDialog = ({ exercise, isOpen, onClose }: any) => {
	if (!isOpen || !exercise) return null;

	const getExerciseTypeLabel = (type: any) => {
		switch (type) {
			case 'MULTIPLE_CHOICE':
				return 'Trắc nghiệm';
			case 'FILL_IN_THE_BLANK':
				return 'Điền vào chỗ trống';
			case 'MATCHING':
				return 'Ghép cặp';
			default:
				return type;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[650px] max-h-[85vh] overflow-y-auto'>
				<DialogHeader>
					<div className='flex items-center'>
						<Badge className='mr-2 bg-purple-100 text-purple-800 border-purple-200'>
							{getExerciseTypeLabel(exercise.type)}
						</Badge>
						<DialogTitle>{exercise.title}</DialogTitle>
					</div>
					<DialogDescription>Chi tiết bài tập</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					{exercise.description && (
						<div className='bg-purple-50 p-4 rounded-lg'>
							<h4 className='font-medium mb-2 text-purple-800'>Mô tả bài tập</h4>
							<p className='text-sm text-purple-700 whitespace-pre-line'>{exercise.description}</p>
						</div>
					)}

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<h4 className='text-sm font-medium text-gray-500 mb-1'>Loại bài tập</h4>
							<p className='font-medium'>{getExerciseTypeLabel(exercise.type)}</p>
						</div>
						<div>
							<h4 className='text-sm font-medium text-gray-500 mb-1'>Số câu hỏi</h4>
							<p className='font-medium'>{exercise.questions?.length || 0} câu</p>
						</div>
					</div>

					{exercise.questions && exercise.questions.length > 0 && (
						<div>
							<h4 className='font-medium mt-4 mb-3 text-purple-800 border-b pb-2'>Danh sách câu hỏi</h4>
							<Accordion type='single' collapsible className='space-y-3'>
								{exercise.questions.map((question: any, index: any) => (
									<AccordionItem
										key={question.id}
										value={`question-${question.id}`}
										className='bg-white border rounded-lg overflow-hidden'
									>
										<AccordionTrigger className='px-4 py-3 hover:bg-gray-50'>
											<div className='flex items-center text-left'>
												<span className='font-medium'>Câu {index + 1}:</span>
												<span className='ml-2 text-gray-800'>
													{question.content.length > 60
														? `${question.content.substring(0, 60)}...`
														: question.content}
												</span>
											</div>
										</AccordionTrigger>
										<AccordionContent className='px-4 pb-4 pt-2'>
											<div className='space-y-4'>
												<div>
													<h5 className='text-sm font-medium text-gray-600 mb-1'>
														Nội dung câu hỏi:
													</h5>
													<p className='text-gray-900'>{question.content}</p>
												</div>

												{question.hint && (
													<div>
														<h5 className='text-sm font-medium text-amber-600 mb-1'>
															Gợi ý:
														</h5>
														<p className='text-gray-800 text-sm'>{question.hint}</p>
													</div>
												)}

												{exercise.type === 'MULTIPLE_CHOICE' && question.options && (
													<div>
														<h5 className='text-sm font-medium text-gray-600 mb-2'>
															Các lựa chọn:
														</h5>
														<RadioGroup defaultValue='' className='space-y-2'>
															{question.options.map((option: any) => (
																<div
																	key={option.id}
																	className={`flex items-center space-x-2 p-2 rounded-md ${
																		option.correct
																			? 'bg-green-50 border border-green-200'
																			: ''
																	}`}
																>
																	<RadioGroupItem
																		value={`option-${option.id}`}
																		id={`option-${option.id}`}
																		disabled
																		checked={option.correct}
																	/>
																	<Label
																		htmlFor={`option-${option.id}`}
																		className={`flex-1 ${
																			option.correct
																				? 'font-medium text-green-700'
																				: ''
																		}`}
																	>
																		{option.content}
																	</Label>
																	{option.correct && (
																		<Badge className='bg-green-100 text-green-800 border-green-200'>
																			Đáp án đúng
																		</Badge>
																	)}
																</div>
															))}
														</RadioGroup>
													</div>
												)}

												{question.correctAnswer && (
													<div>
														<h5 className='text-sm font-medium text-green-600 mb-1'>
															Đáp án đúng:
														</h5>
														<p className='text-green-700 font-medium'>
															{question.correctAnswer}
														</p>
													</div>
												)}

												{question.answerExplanation && (
													<div className='bg-blue-50 p-3 rounded-md'>
														<h5 className='text-sm font-medium text-blue-700 mb-1'>
															Giải thích:
														</h5>
														<p className='text-sm text-blue-800'>
															{question.answerExplanation}
														</p>
													</div>
												)}

												<div className='flex justify-between text-sm'>
													<span className='text-gray-500'>
														Điểm:{' '}
														<span className='font-medium text-gray-700'>
															{question.points || 1}
														</span>
													</span>
													<span className='text-gray-500'>ID: {question.id}</span>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</div>
					)}
				</div>
				<DialogFooter>
					<Button variant='secondary' onClick={onClose}>
						Đóng
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ExerciseDetailDialog;
