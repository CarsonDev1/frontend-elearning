'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle, Award, Clock, Users, BookOpen, Sparkles } from 'lucide-react';

interface WhyChooseJPEProps {
	dictionary: any;
}

const WhyChooseJPE = ({ dictionary }: WhyChooseJPEProps) => {
	// Extract dictionary texts with fallbacks
	const t = dictionary?.whyChooseUs || {
		title: 'Why Choose JPE for Japanese Learning?',
		subtitle: 'Discover the JPE advantage for your Japanese language journey',
		certifiedTeachers: {
			title: 'Certified Teachers',
			description: 'Learn from JLPT-certified instructors with years of teaching experience',
		},
		quickProgress: {
			title: 'Quick Progress',
			description: 'Our proven methodology helps students pass JLPT in just 3 months',
		},
		flexibleSchedule: {
			title: 'Flexible Schedule',
			description: 'Study anytime, anywhere with our on-demand online platform',
		},
		personalizedLearning: {
			title: 'Personalized Learning',
			description: 'Customized learning paths based on your proficiency and goals',
		},
		practicalApproach: {
			title: 'Practical Approach',
			description: 'Focus on conversational skills you can apply in real-life situations',
		},
		communitySupport: {
			title: 'Community Support',
			description: 'Join a supportive community of Japanese language learners',
		},
	};

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.5,
			},
		},
	};

	// Define the feature cards with their respective icons
	const features = [
		{
			icon: <Award className='h-10 w-10 text-primary' />,
			title: t.certifiedTeachers?.title,
			description: t.certifiedTeachers?.description,
		},
		{
			icon: <Clock className='h-10 w-10 text-primary' />,
			title: t.quickProgress?.title,
			description: t.quickProgress?.description,
		},
		{
			icon: <BookOpen className='h-10 w-10 text-primary' />,
			title: t.flexibleSchedule?.title,
			description: t.flexibleSchedule?.description,
		},
		{
			icon: <Sparkles className='h-10 w-10 text-primary' />,
			title: t.personalizedLearning?.title,
			description: t.personalizedLearning?.description,
		},
		{
			icon: <CheckCircle className='h-10 w-10 text-primary' />,
			title: t.practicalApproach?.title,
			description: t.practicalApproach?.description,
		},
		{
			icon: <Users className='h-10 w-10 text-primary' />,
			title: t.communitySupport?.title,
			description: t.communitySupport?.description,
		},
	];

	return (
		<section className='py-16 bg-gray-50'>
			<div className='container-lg'>
				{/* Section header */}
				<div className='text-center mb-12'>
					<h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>{t.title}</h2>
					<p className='text-lg text-gray-600 max-w-3xl mx-auto'>{t.subtitle}</p>

					{/* Decorative elements */}
					<div className='flex justify-center mt-6'>
						<div className='w-20 h-1 bg-primary rounded-full'></div>
					</div>
				</div>

				{/* Features grid */}
				<motion.div
					className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
					variants={containerVariants}
					initial='hidden'
					whileInView='visible'
					viewport={{ once: true, margin: '-100px' }}
				>
					{features.map((feature, index) => (
						<motion.div
							key={index}
							className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full'
							variants={itemVariants}
						>
							<div className='p-3 bg-primary/10 rounded-full w-fit mb-4'>{feature.icon}</div>
							<h3 className='text-xl font-bold text-gray-800 mb-2'>{feature.title}</h3>
							<p className='text-gray-600 flex-grow'>{feature.description}</p>
						</motion.div>
					))}
				</motion.div>

				{/* Testimonial or callout section */}
				<div className='mt-16 bg-gradient-to-r from-[#5ece66] to-primary rounded-2xl overflow-hidden shadow-lg'>
					<div className='flex flex-col lg:flex-row'>
						<div className='lg:w-1/2 p-8 md:p-12 text-white'>
							<div className='flex items-center mb-6'>
								<div className='w-12 h-12 rounded-full bg-white flex items-center justify-center mr-4'>
									<Image src='/images/Logo.gif' alt='JPE Logo' width={30} height={30} />
								</div>
								<h3 className='text-2xl font-bold'>JPE</h3>
							</div>
							<h4 className='text-xl md:text-2xl font-bold mb-4'>
								{t.mainBenefit || 'Pass JLPT in 3 Months'}
							</h4>
							<p className='text-white/90 mb-6'>
								{t.mainDescription ||
									'Our specialized curriculum is designed specifically to help you achieve success in JLPT certification while developing practical Japanese conversation skills for daily life and work.'}
							</p>
							<div className='space-y-3'>
								{[1, 2, 3].map((item) => (
									<div key={item} className='flex items-start'>
										<CheckCircle className='h-5 w-5 text-white mr-2 flex-shrink-0 mt-0.5' />
										<p className='text-white/90'>{t[`benefit${item}`] || `Benefit ${item}`}</p>
									</div>
								))}
							</div>
						</div>
						<div className='lg:w-1/2 relative'>
							<div className='h-64 lg:h-full relative'>
								<Image
									src='/images/choose-image.png'
									alt='Japanese Learning'
									fill
									className='object-cover'
								/>
								<div className='absolute inset-0 bg-black/20'></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default WhyChooseJPE;
