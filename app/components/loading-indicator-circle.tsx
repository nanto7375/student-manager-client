import * as Arakit from '@ariakit/react'
import Icon from '~/components/icon'
import { modalDefaultStyle } from '~/components/modal'
import { cn } from '~/utils/style'

export function LoadingIndicatorCircle() {
	return (
		<Arakit.Dialog
			open={true}
			hideOnEscape={false}
			hideOnInteractOutside={false}
			preventBodyScroll={true}
			className={cn(
				modalDefaultStyle,
				'w-fit overflow-hidden rounded-[16px] p-[12px] shadow-[0_0_30px_0_rgba(0,0,0,0.3)]',
			)}
		>
			<Icon
				aria-hidden="true"
				name="loading"
				size={120}
				className="animate-spin"
			/>
			<span className="sr-only">Please wait</span>
		</Arakit.Dialog>
	)
}
