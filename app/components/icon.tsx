import type { SVGProps } from 'react'
import { cn } from '~/utils/style'
import type { IconName } from './icons/name'
import href from './icons/sprite.svg'

export { href }

export default function Icon({
	name,
	size,
	title,
	className,
	...props
}: SVGProps<SVGSVGElement> & { name: IconName; size: number; title?: string }) {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg
			className={cn('shrink-0', className)}
			{...props}
			width={size}
			height={size}
		>
			{title ? <title>{title}</title> : null}
			<use href={`${href}#${name}`} />
		</svg>
	)
}
