'use client';
import ComboGrid from '@/app/pages/home/combo-grid';
import ComboService from '@/services/combo-service';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

const PublicCombo = ({ dictionary }: { dictionary: any }) => {
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(6);
	const [allCombos, setAllCombos] = useState<any[]>([]);

	const {
		data: combosData,
		isLoading,
		isFetching,
	} = useQuery<any>({
		queryKey: ['public-combos', page, pageSize],
		queryFn: () => ComboService.getPublicCombo(page, pageSize),
	});

	// Combined data from all pages
	useEffect(() => {
		if (combosData?.content && !isLoading) {
			if (page === 0) {
				setAllCombos(combosData.content);
			} else {
				setAllCombos((prev) => [...prev, ...combosData.content]);
			}
		}
	}, [combosData, isLoading, page]);

	const handleLoadMore = () => {
		setPage((prev) => prev + 1);
	};

	return (
		<div className='relative container-lg'>
			<div className='absolute -top-20 right-0'>
				<Image src='/images/decor-public-combo.png' width={50} height={50} alt='decor' />
			</div>
			<div className='relative sec-com'>
				<div className='pb-12'>
					<h3 className='text-center text-4xl text-primary font-bold uppercase'>
						{dictionary.combos?.title || 'Combo Courses'}
					</h3>
					<p className='text-center text-gray-600 mt-3 max-w-3xl mx-auto'>
						{dictionary.combos?.description ||
							'Discover our specially curated course packages for maximum learning benefit.'}
					</p>
				</div>

				<ComboGrid
					combos={allCombos}
					isLoading={isLoading}
					isFetching={isFetching}
					dictionary={dictionary}
					onLoadMore={handleLoadMore}
					hasMore={combosData?.last === false}
					loadingMore={isFetching && page > 0}
				/>
			</div>
		</div>
	);
};

export default PublicCombo;
