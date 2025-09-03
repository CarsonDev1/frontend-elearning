'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function TestNotificationPage() {
	const [loading, setLoading] = useState(false);

	const createTestNotification = async () => {
		try {
			setLoading(true);
			await api.post('/api/test/create-notification');
			toast.success('Thông báo test đã được tạo thành công!');
		} catch (error) {
			console.error('Error creating test notification:', error);
			toast.error('Có lỗi xảy ra khi tạo thông báo test');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='container mx-auto p-6'>
			<Card>
				<CardHeader>
					<CardTitle>Test Notification System</CardTitle>
					<CardDescription>Tạo thông báo test để kiểm tra hệ thống notification</CardDescription>
				</CardHeader>
				<CardContent>
					<Button onClick={createTestNotification} disabled={loading} className='w-full'>
						{loading ? 'Đang tạo...' : 'Tạo thông báo test'}
					</Button>

					<div className='mt-4 p-4 bg-muted rounded-lg'>
						<h4 className='font-medium mb-2'>Hướng dẫn test:</h4>
						<ol className='list-decimal list-inside space-y-1 text-sm'>
							<li>Click nút "Tạo thông báo test"</li>
							<li>Kiểm tra notification bell ở góc trên bên phải</li>
							<li>Click vào notification bell để xem thông báo</li>
							<li>Test các chức năng đánh dấu đã đọc</li>
						</ol>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
