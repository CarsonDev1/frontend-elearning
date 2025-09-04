'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthService, { LoginParams } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
	email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
	password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
	const { toast } = useToast();
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		mode: 'onTouched',
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);

		try {
			const loginParams: LoginParams = {
				email: data.email,
				password: data.password,
			};

			const response = await AuthService.login(loginParams);

			toast({
				title: 'Đăng nhập thành công',
				description: 'Bạn đã đăng nhập thành công.',
				variant: 'success',
			});

			if (response?.user.roles?.[0] === 'ROLE_ADMIN') {
				router.push('/admin');
			} else if (response?.user.roles?.[0] === 'ROLE_TUTOR') {
				router.push('/tutor/course');
			} else {
				router.push('/');
			}
			console.log('response', response);
		} catch (error) {
			console.error('Login failed:', error);
			toast({
				title: 'Đăng nhập thất bại',
				description: 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<Card className='border-none shadow-none'>
			<form onSubmit={handleSubmit(onSubmit)}>
				<CardContent className='pt-6 space-y-4'>
					<div className='space-y-2'>
						<Input
							id='email'
							placeholder='Email'
							autoComplete='email'
							{...register('email')}
							type='email'
						/>
						{errors.email && <p className='text-red-500 text-xs'>{errors.email.message}</p>}
					</div>
					<div className='space-y-2'>
						<div className='relative'>
							<Input
								id='password'
								placeholder='Mật khẩu'
								autoComplete='current-password'
								{...register('password')}
								type={showPassword ? 'text' : 'password'}
							/>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
								onClick={togglePasswordVisibility}
								tabIndex={-1}
							>
								{showPassword ? (
									<EyeOff className='h-4 w-4 text-gray-400' />
								) : (
									<Eye className='h-4 w-4 text-gray-400' />
								)}
							</Button>
						</div>
						{errors.password && <p className='text-red-500 text-xs'>{errors.password.message}</p>}
						<div className='flex items-end justify-end'>
							<Link
								href='/forgot-password'
								className='text-sm text-sky-500 hover:text-sky-600 hover:underline'
							>
								Quên mật khẩu?
							</Link>
						</div>
					</div>
				</CardContent>
				<CardFooter className='flex flex-col space-y-4'>
					<Button type='submit' variant='primary' className='w-full' disabled={isLoading}>
						{isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
					</Button>
					<div className='relative w-full'>
						<div className='flex items-center my-2'>
							<div className='flex-grow border-t-2 border-gray-200 border'></div>
							<span className='px-4 text-gray-500 text-sm font-medium uppercase'>hoặc</span>
							<div className='flex-grow border-t-2 border-gray-200 border'></div>
						</div>
					</div>
					<div className='flex items-center gap-3 w-full'>
						<Button type='button' variant='primaryOutline' className='w-full'>
							<svg className='mr-2 h-4 w-4' viewBox='0 0 24 24' fill='currentColor'>
								<path d='M22.675 0h-21.35C.595 0 0 .593 0 1.326v21.348C0 23.407.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.797.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.407 24 22.674V1.326C24 .593 23.406 0 22.675 0z' />
							</svg>
							Facebook
						</Button>
						<Button type='button' variant='primaryOutline' className='w-full'>
							<svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
								<path
									d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
									fill='#4285F4'
								/>
								<path
									d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
									fill='#34A853'
								/>
								<path
									d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
									fill='#FBBC05'
								/>
								<path
									d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
									fill='#EA4335'
								/>
							</svg>
							Google
						</Button>
					</div>
				</CardFooter>
			</form>
		</Card>
	);
}
