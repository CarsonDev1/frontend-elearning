import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DiscountType, VoucherCreateUpdateRequest } from '@/services/voucher-service';

interface VoucherFormProps {
	formData: VoucherCreateUpdateRequest;
	errorMessage: string | null;
	isLoading: boolean;
	courses: any[];
	isLoadingCourses: boolean;
	combos: any[];
	isLoadingCombos: boolean;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	onNumberInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSelectChange: (id: string, value: string) => void;
	onDateChange: any;
	onToggleCourse: (courseId: number) => void;
	onToggleCombo: (comboId: number) => void;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
	submitButtonText: string;
}

const VoucherForm: React.FC<VoucherFormProps> = ({
	formData,
	errorMessage,
	isLoading,
	courses,
	isLoadingCourses,
	combos,
	isLoadingCombos,
	onInputChange,
	onNumberInputChange,
	onSelectChange,
	onDateChange,
	onToggleCourse,
	onToggleCombo,
	onSubmit,
	onCancel,
	submitButtonText,
}) => {
	// Format date for display
	const formatDate = (dateString: string) => {
		try {
			return format(parseISO(dateString), 'dd/MM/yyyy', { locale: vi });
		} catch (e) {
			return 'Ngày không hợp lệ';
		}
	};

	// Chuyển đổi ISO date string thành Date object cho calendar
	const isoStringToDate = (isoString: string): Date | undefined => {
		try {
			return parseISO(isoString);
		} catch (e) {
			return undefined;
		}
	};

	// Chuẩn hóa ngày giờ để đảm bảo không bị trừ ngày
	const normalizeDate = (date: Date | undefined): string => {
		if (!date) return new Date().toISOString();

		// Fix: Tạo ngày mới với thời gian là 12:00:00
		// Để đảm bảo không bị vấn đề với múi giờ
		const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);

		return normalized.toISOString();
	};

	// Xử lý sự kiện thay đổi ngày đã được sửa
	const handleDateChange = (id: string, date: Date | undefined) => {
		if (date) {
			const isoString: any = normalizeDate(date);
			onDateChange(id, isoString);
		}
	};

	return (
		<form onSubmit={onSubmit}>
			<div className='py-4 flex flex-col gap-4'>
				<div className='grid grid-cols-2 gap-4'>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='code'>Mã giảm giá</Label>
						<Input
							id='code'
							placeholder='WELCOME2024'
							value={formData.code}
							onChange={onInputChange}
							disabled={!!formData.code}
						/>
					</div>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='discountType'>Loại giảm giá</Label>
						<Select
							value={formData.discountType}
							onValueChange={(value) => onSelectChange('discountType', value)}
						>
							<SelectTrigger className='h-10'>
								<SelectValue placeholder='Chọn loại giảm giá' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='PERCENTAGE'>Phần trăm (%)</SelectItem>
								<SelectItem value='FIXED_AMOUNT'>Số tiền cố định (VND)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='discountValue'>Giá trị giảm giá</Label>
						<Input
							id='discountValue'
							type='number'
							placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '100000'}
							value={formData.discountValue || ''}
							onChange={onNumberInputChange}
						/>
					</div>
					{formData.discountType === 'PERCENTAGE' && (
						<div className='flex flex-col gap-2'>
							<Label htmlFor='maximumDiscountAmount'>Giảm tối đa (VND)</Label>
							<Input
								id='maximumDiscountAmount'
								type='number'
								placeholder='100000'
								value={formData.maximumDiscountAmount || ''}
								onChange={onNumberInputChange}
							/>
						</div>
					)}
					<div className='flex flex-col gap-2'>
						<Label htmlFor='minimumPurchaseAmount'>Đơn hàng tối thiểu (VND)</Label>
						<Input
							id='minimumPurchaseAmount'
							type='number'
							placeholder='0'
							value={formData.minimumPurchaseAmount || ''}
							onChange={onNumberInputChange}
						/>
					</div>
				</div>

				<div className='flex flex-col gap-2'>
					<Label htmlFor='description'>Mô tả</Label>
					<Textarea
						id='description'
						placeholder='Ưu đãi đặc biệt...'
						value={formData.description}
						onChange={onInputChange}
					/>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div className='flex flex-col gap-2'>
						<Label>Hiệu lực từ ngày</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={'superOutline'}
									className='flex justify-start text-left font-normal h-10'
								>
									<CalendarIcon className='mr-2 h-4 w-4' />
									{formData.validFrom ? formatDate(formData.validFrom) : 'Chọn ngày'}
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-0'>
								<Calendar
									mode='single'
									selected={isoStringToDate(formData.validFrom)}
									onSelect={(date) => handleDateChange('validFrom', date)}
									initialFocus
									locale={vi}
								/>
							</PopoverContent>
						</Popover>
					</div>
					<div className='flex flex-col gap-2'>
						<Label>Hiệu lực đến ngày</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={'superOutline'}
									className='flex justify-start text-left font-normal h-10'
								>
									<CalendarIcon className='mr-2 h-4 w-4' />
									{formData.validUntil ? formatDate(formData.validUntil) : 'Chọn ngày'}
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-0'>
								<Calendar
									mode='single'
									selected={isoStringToDate(formData.validUntil)}
									onSelect={(date) => handleDateChange('validUntil', date)}
									initialFocus
									locale={vi}
								/>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='totalUsageLimit'>Tổng lượt sử dụng tối đa</Label>
						<Input
							id='totalUsageLimit'
							type='number'
							placeholder='100'
							value={formData.totalUsageLimit || ''}
							onChange={onNumberInputChange}
						/>
					</div>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='perUserLimit'>Lượt sử dụng/người dùng</Label>
						<Input
							id='perUserLimit'
							type='number'
							placeholder='1'
							value={formData.perUserLimit || ''}
							onChange={onNumberInputChange}
						/>
					</div>
				</div>

				{/* Applicable Courses & Combos */}
				<div className='grid grid-cols-1 gap-4'>
					<div className='flex flex-col gap-2'>
						<Label>Áp dụng cho khóa học</Label>
						<div className='border rounded-md p-3 h-40 overflow-y-auto'>
							{isLoadingCourses ? (
								<p className='text-sm text-gray-500'>Đang tải...</p>
							) : courses?.length > 0 ? (
								<div className='space-y-2'>
									{courses.map((course: any) => (
										<div key={course.id} className='flex items-center gap-2'>
											<Checkbox
												id={`course-${course.id}`}
												checked={formData.applicableCourseIds.includes(course.id)}
												onCheckedChange={() => onToggleCourse(course.id)}
											/>
											<Label htmlFor={`course-${course.id}`} className='text-sm'>
												{course.title}
											</Label>
										</div>
									))}
								</div>
							) : (
								<p className='text-sm text-gray-500'>Không có khóa học nào</p>
							)}
						</div>
					</div>

					<div className='flex flex-col gap-2'>
						<Label>Áp dụng cho combo</Label>
						<div className='border rounded-md p-3 h-40 overflow-y-auto'>
							{isLoadingCombos ? (
								<p className='text-sm text-gray-500'>Đang tải...</p>
							) : combos?.length > 0 ? (
								<div className='space-y-2'>
									{combos.map((combo: any) => (
										<div key={combo.id} className='flex items-center gap-2'>
											<Checkbox
												id={`combo-${combo.id}`}
												checked={formData.applicableComboIds.includes(combo.id)}
												onCheckedChange={() => onToggleCombo(combo.id)}
											/>
											<Label htmlFor={`combo-${combo.id}`} className='text-sm'>
												{combo.title}
											</Label>
										</div>
									))}
								</div>
							) : (
								<p className='text-sm text-gray-500'>Không có combo nào</p>
							)}
						</div>
					</div>
				</div>

				{errorMessage && (
					<div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm'>
						<p className='font-medium'>Lỗi</p>
						<p>{errorMessage}</p>
					</div>
				)}
			</div>

			<div className='flex justify-end gap-2 pt-2'>
				{/* <Button variant='superOutline' onClick={onCancel}>
					Hủy
				</Button> */}
				<Button variant='primary' type='submit' disabled={isLoading}>
					{isLoading ? 'Đang xử lý...' : submitButtonText}
				</Button>
			</div>
		</form>
	);
};

export default VoucherForm;
