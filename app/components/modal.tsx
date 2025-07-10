import * as Ariakit from '@ariakit/react'
import type { DialogProps } from '@ariakit/react'
import Icon from '~/components/icon'
import { cn } from '~/utils/style'

export const modalDefaultStyle =
	'fixed inset-0 z-10 m-auto h-fit max-h-[85vh] w-11/12 max-w-[360px] overflow-y-auto break-anywhere bg-white py-[16px] px-[24px]'

// Close button with optional heading.
export function ModalTitleBar({ title }: { title?: string }) {
	return (
		<div className="flex items-center">
			{title ? (
				<Ariakit.DialogHeading className="font-bold text-[18px] leading-[1.33]">
					{title}
				</Ariakit.DialogHeading>
			) : null}
			<Ariakit.DialogDismiss className="-mr-[4px] ml-auto">
				<Icon aria-hidden="true" name="cross" size={24} />
				<span className="sr-only">Close</span>
			</Ariakit.DialogDismiss>
		</div>
	)
}

export function ConfirmationModal({
	className,
	description,
	...props
}: DialogProps & { description: string }) {
	return (
		<Ariakit.Dialog
			hideOnEscape={false}
			hideOnInteractOutside={false}
			unmountOnHide={true}
			className={cn(
				'fixed inset-0 z-10 m-auto h-fit w-[calc(32700%/375)] max-w-[360px] bg-white px-[60px] py-[40px]',
				className,
			)}
			{...props}
		>
			<Ariakit.DialogDescription className="text-center font-bold text-[18px] leading-[1.33]">
				{description}
			</Ariakit.DialogDescription>
			<Ariakit.DialogDismiss className="mt-[24px] h-[40px] w-full bg-black text-[12px] text-white">
				Confirm
			</Ariakit.DialogDismiss>
		</Ariakit.Dialog>
	)
}
