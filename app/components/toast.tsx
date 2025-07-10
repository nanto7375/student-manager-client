import type React from 'react'
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'
import Icon from '~/components/icon'

export function Toaster() {
	return (
		<SonnerToaster
			position="top-center"
			className="mx-auto w-[calc(100%-2*16px)]! max-w-[356px]!"
			toastOptions={{ className: 'w-full! mx-auto' }}
		/>
	)
}

export function toast(message: string, type: 'warning' | 'error' | 'success') {
	sonnerToast.custom(() => (
		<div className="flex items-center gap-x-[16px] whitespace-pre-wrap rounded-[16px] bg-white px-[16px] py-[12px] font-[500] text-[14px] shadow-toast md:gap-x-[24px] md:px-[24px] md:py-[16px] md:text-[16px]">
			{type === 'success' ? (
				<Icon name="check" size={24} className="text-[#00D614]" />
			) : type === 'error' ? (
				<Icon name="cross" size={24} className="text-[#ed5e5e]" />
			) : (
				<Icon name="warn" size={24} className="text-[#ed5e5e]" />
			)}
			<p className="leading-tight">{message}</p>
		</div>
	))
}

export const predefinedToasts = {
	PAGE_DOES_NOT_EXIST: () => toast('The page does not exist.', 'warning'),
	SOMETHING_WENT_WRONG: () => toast('Something went wrong.', 'warning'),
}
