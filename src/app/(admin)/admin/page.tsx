'use client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import StatisticsService, { DashboardStatistics } from '@/services/statistics-service';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
	AreaChart,
	Area,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2Icon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

// Duolingo-inspired color palette
const COLORS = ['#58cc02', '#ff9600', '#ff4b4b', '#1cb0f6', '#ce82ff', '#ffc800'];

const Admin = () => {
	const { user, isLoading, isAuthenticated } = useAuth();
	const router = useRouter();

	// Dashboard statistics query
	const {
		data: statistics,
		isLoading: isLoadingStats,
		error,
	} = useQuery({
		queryKey: ['dashboardStatistics'],
		queryFn: () => StatisticsService.getDashboardStatistics(),
		enabled: isAuthenticated && user?.roles?.[0] === 'ROLE_ADMIN',
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		// If authentication check is complete (not loading)
		if (!isLoading) {
			// If user is not authenticated, redirect to login
			if (!isAuthenticated) {
				toast({
					variant: 'destructive',
					title: 'Access denied',
					description: 'Please log in to continue.',
				});
				router.push('/login');
			}
			// If user is authenticated but not admin, redirect to home
			else if (user?.roles?.[0] !== 'ROLE_ADMIN') {
				toast({
					variant: 'destructive',
					title: 'Permission denied',
					description: 'You do not have permission to access this page.',
				});
				router.push('/');
			}
		}
	}, [user, isLoading, isAuthenticated, router]);

	// Show error toast when query fails
	useEffect(() => {
		if (error) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to load dashboard statistics.',
			});
			console.error('Error fetching dashboard data:', error);
		}
	}, [error]);

	// Format revenue data for the chart
	const formatRevenueData = () => {
		if (!statistics?.recentRevenue || statistics.recentRevenue.length === 0) {
			return [];
		}

		return statistics.recentRevenue.map((item) => ({
			name: `${getMonthName(item.month)} ${item.year}`,
			revenue: item.amount,
			transactions: item.transactionCount,
		}));
	};

	// Format enrollment data for the pie chart
	const formatEnrollmentData = () => {
		if (!statistics?.enrollmentsByLevel) {
			return [];
		}

		return Object.entries(statistics.enrollmentsByLevel).map(([level, count], index) => ({
			name: level,
			value: count,
			color: COLORS[index % COLORS.length],
		}));
	};

	// Helper function to get month name
	const getMonthName = (month: number) => {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return months[month - 1];
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<Loader2Icon className='h-8 w-8 animate-spin text-primary' />
				<span className='ml-2 text-lg font-medium'>Loading dashboard...</span>
			</div>
		);
	}

	return (
		<div className='p-6 bg-gray-50 min-h-screen'>
			<h1 className='text-3xl font-bold mb-8 text-gray-900'>Admin Dashboard</h1>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				<StatCard title='Total Students' value={statistics?.totalStudents || 0} icon='👨‍🎓' color='#58cc02' />
				<StatCard title='Total Tutors' value={statistics?.totalTutors || 0} icon='👨‍🏫' color='#1cb0f6' />
				<StatCard title='Total Courses' value={statistics?.totalCourses || 0} icon='📚' color='#ff9600' />
				<StatCard
					title='Total Enrollments'
					value={statistics?.totalEnrollments || 0}
					icon='📝'
					color='#ff4b4b'
				/>
			</div>

			{/* Approval Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
				<ApprovalCard
					title='Pending Tutor Approvals'
					count={statistics?.pendingTutorApprovals || 0}
					actionText='View Tutors'
					onClick={() => router.push('/admin/tutors')}
				/>
				<ApprovalCard
					title='Pending Course Approvals'
					count={statistics?.pendingCourseApprovals || 0}
					actionText='View Courses'
					onClick={() => router.push('/admin/course')}
				/>
			</div>

			{/* Revenue Chart */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
				<Card className='col-span-1 lg:col-span-2'>
					<CardHeader>
						<CardTitle>Revenue Over Time</CardTitle>
						<CardDescription>Monthly revenue breakdown</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='h-80'>
							<ResponsiveContainer width='100%' height='100%'>
								<AreaChart data={formatRevenueData()}>
									<CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
									<XAxis dataKey='name' stroke='#64748b' />
									<YAxis stroke='#64748b' />
									<Tooltip
										contentStyle={{
											backgroundColor: '#fff',
											border: '1px solid #e2e8f0',
											borderRadius: '8px',
											boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
										}}
									/>
									<Area
										type='monotone'
										dataKey='revenue'
										stroke='#58cc02'
										fill='#58cc02'
										fillOpacity={0.6}
										activeDot={{ r: 8 }}
										name='Revenue'
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Enrollments by Level & Total Revenue */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<Card>
					<CardHeader>
						<CardTitle>Enrollments by Level</CardTitle>
						<CardDescription>Distribution of student enrollments by course level</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='h-72 flex items-center justify-center'>
							{formatEnrollmentData().length > 0 ? (
								<ResponsiveContainer width='100%' height='100%'>
									<PieChart>
										<Pie
											data={formatEnrollmentData()}
											cx='50%'
											cy='50%'
											labelLine={false}
											outerRadius={80}
											fill='#8884d8'
											dataKey='value'
											label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
										>
											{formatEnrollmentData().map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<Legend />
										<Tooltip
											formatter={(value) => [`${value} enrollments`, 'Count']}
											contentStyle={{
												backgroundColor: '#fff',
												border: '1px solid #e2e8f0',
												borderRadius: '8px',
												boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
											}}
										/>
									</PieChart>
								</ResponsiveContainer>
							) : (
								<div className='text-center text-gray-500'>
									<p>No enrollment data available</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Revenue Summary</CardTitle>
						<CardDescription>Total revenue and transaction metrics</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='flex flex-col items-center justify-center h-72'>
							<div className='text-6xl font-bold text-[#58cc02] mb-4'>
								${statistics?.totalRevenue.toLocaleString() || '0'}
							</div>
							<p className='text-xl text-gray-600 mb-6'>Total Revenue</p>

							<div className='w-full max-w-xs bg-gray-100 rounded-full h-4 mb-2'>
								<div
									className='bg-[#1cb0f6] h-4 rounded-full'
									style={{
										width: `${Math.min(100, (statistics?.totalEnrollments || 0) / 10)}%`,
									}}
								></div>
							</div>
							<p className='text-gray-600'>
								<span className='font-medium'>{statistics?.totalEnrollments || 0}</span> Total
								Enrollments
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }: any) => (
	<Card className='overflow-hidden border-t-4' style={{ borderTopColor: color }}>
		<CardContent className='pt-6'>
			<div className='flex items-center'>
				<div
					className='h-12 w-12 rounded-lg flex items-center justify-center text-2xl'
					style={{ backgroundColor: `${color}20` }}
				>
					{icon}
				</div>
				<div className='ml-4'>
					<p className='text-sm font-medium text-gray-500'>{title}</p>
					<p className='text-2xl font-bold'>{value.toLocaleString()}</p>
				</div>
			</div>
		</CardContent>
	</Card>
);

// Approval Card Component
const ApprovalCard = ({ title, count, actionText, onClick }: any) => (
	<Card className='overflow-hidden'>
		<CardContent className='pt-6'>
			<div className='flex items-center justify-between'>
				<div>
					<p className='text-lg font-medium'>{title}</p>
					<p className='text-3xl font-bold'>{count}</p>
				</div>
				{count > 0 && (
					<Button onClick={onClick} variant='secondary'>
						{actionText}
					</Button>
				)}
			</div>
		</CardContent>
	</Card>
);

export default Admin;
