'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User, LogOut, BookOpen, UserCog } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

interface Language {
	code: string;
	name: string;
	flagSrc: string;
	labelText: string;
}

interface UserMenuText {
	myCourses: string;
	profile: string;
	logout: string;
	login: string;
	register: string;
}

const Header = () => {
	const router = useRouter();
	const pathname = usePathname();
	const [scrolled, setScrolled] = useState(false);
	const { user, logout } = useAuth();

	// Fetch dictionary based on current language
	const pathnameSegments = pathname.split('/').filter(Boolean);
	const currentLocale = ['vi', 'jp'].includes(pathnameSegments[0]) ? pathnameSegments[0] : 'vi';

	const { data: dict } = useQuery({
		queryKey: ['dictionary', currentLocale],
		queryFn: async () => {
			const response = await fetch(`/api/dictionary?lang=${currentLocale}`);
			if (!response.ok) {
				throw new Error('Failed to fetch dictionary');
			}
			return response.json();
		},
	});

	const languages: Language[] = [
		{
			code: 'vi',
			name: 'Tiếng Việt',
			flagSrc: '/images/vi.svg',
			labelText: 'NGÔN NGỮ HIỂN THỊ',
		},
		{
			code: 'jp',
			name: '日本語',
			flagSrc: '/images/jp.svg',
			labelText: 'サイトの言語',
		},
	];

	const userMenu: UserMenuText = {
		myCourses: dict?.user?.myCourses || 'My Courses',
		profile: dict?.user?.profile || 'Profile',
		logout: dict?.user?.logout || 'Logout',
		login: dict?.user?.login || 'Login',
		register: dict?.user?.register || 'Register',
	};

	const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

	const switchLanguage = (locale: string) => {
		if (locale === currentLocale) return;

		const pathWithoutLocale = pathnameSegments.slice(1).join('/');
		const newPath = `/${locale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ''}`;

		router.push(newPath);
	};

	const handleLogout = async () => {
		try {
			await logout();
			router.push(`/${currentLocale}`);
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	// Get initials from user's full name
	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.substring(0, 2);
	};

	useEffect(() => {
		const handleScroll = () => {
			const offset = window.scrollY;
			if (offset > 10) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	return (
		<header className='sticky top-0 z-50'>
			<div
				className={`py-2 sm:py-4 w-full transition-all duration-300 ${
					scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : 'bg-white'
				}`}
			>
				<div className='container-lg'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center'>
							<Link href={`/${currentLocale}`}>
								<div className='flex items-center'>
									<Image src='/images/Logo.gif' width={50} height={50} alt='Logo' />
									<h3 className='text-primary font-extrabold text-center text-lg sm:text-2xl italic'>
										JPE
									</h3>
								</div>
							</Link>
						</div>

						<div className='flex items-center space-x-4'>
							{/* Language Selector */}
							<DropdownMenu>
								<DropdownMenuTrigger className='flex items-center px-3 py-2 border-none rounded-md hover:bg-gray-50 focus:outline-none'>
									<div className='flex items-center'>
										<div className='w-6 h-4 relative overflow-hidden rounded mr-2'>
											<Image
												src={currentLanguage.flagSrc}
												alt={currentLanguage.code}
												fill
												className='object-cover'
											/>
										</div>
										<span className='font-medium text-sm sm:text-base'>{currentLanguage.name}</span>
										<ChevronDown className='h-4 w-4 ml-1' />
									</div>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end' className='w-64'>
									{languages.map((language) => (
										<DropdownMenuItem
											key={language.code}
											onClick={() => switchLanguage(language.code)}
											className={`flex items-center px-3 py-2 ${
												currentLocale === language.code ? 'bg-gray-100' : ''
											}`}
										>
											<div className='mr-2 w-6 h-4 relative overflow-hidden rounded'>
												<Image
													src={language.flagSrc}
													alt={language.code}
													fill
													className='object-cover'
												/>
											</div>
											<span>{language.name}</span>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* User Menu */}
							{user ? (
								<DropdownMenu>
									<DropdownMenuTrigger className='focus:outline-none'>
										<div className='w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors'>
											{user.avatarUrl ? (
												<Image
													src={user.avatarUrl}
													alt={user.fullName}
													width={36}
													height={36}
													className='rounded-full object-cover w-full h-full'
												/>
											) : (
												<span className='font-medium text-sm'>
													{getInitials(user.fullName)}
												</span>
											)}
										</div>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end' className='w-56'>
										<div className='px-4 py-3 border-b'>
											<p className='font-medium text-sm'>{user.fullName}</p>
											<p className='text-xs text-gray-500 truncate'>{user.email}</p>
										</div>
										<DropdownMenuItem asChild>
											<Link
												href={`/${currentLocale}/my-course`}
												className='flex items-center px-4 py-2 cursor-pointer'
											>
												<BookOpen className='mr-2 h-4 w-4' />
												<span>{userMenu.myCourses}</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												href={`/${currentLocale}/profile`}
												className='flex items-center px-4 py-2 cursor-pointer'
											>
												<UserCog className='mr-2 h-4 w-4' />
												<span>{userMenu.profile}</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={handleLogout}
											className='flex items-center px-4 py-2 cursor-pointer text-red-600 hover:text-red-700'
										>
											<LogOut className='mr-2 h-4 w-4' />
											<span>{userMenu.logout}</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<div className='flex items-center space-x-2'>
									<Link
										href={`/login`}
										className='text-primary hover:text-primary-dark transition-colors text-sm font-medium'
									>
										{userMenu.login}
									</Link>
									<span className='text-gray-300'>|</span>
									<Link
										href={`/register`}
										className='text-primary hover:text-primary-dark transition-colors text-sm font-medium'
									>
										{userMenu.register}
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
