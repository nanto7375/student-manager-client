import { Container, type ContainerProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export type JustifyContent = 'start' | 'center' | 'end' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | 'left' | 'normal' | 'right';

export type AlignItems = 'start' | 'center' | 'end' | 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'baseline' | 'normal' | 'stretch';

export type FlexDirection = 'column' | 'column-reverse' | 'row' | 'row-reverse' | '-moz-initial' | 'inherit' | 'initial' | 'revert' | 'revert-layer' | 'unset';

export interface FlexContainerProps extends ContainerProps {
  center?: boolean;
  fullWidth?: boolean;
  flexDirection?: FlexDirection;
  fullHeight?: boolean;
  width?: string;
  height?: string;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  gap?: number;
}

export const FlexContainer = styled(Container, {
  shouldForwardProp: (prop) => prop !== 'center' && prop !== 'fullWidth' && prop !== 'flexDirection' && prop !== 'fullHeight' && prop !== 'justifyContent' && prop !== 'alignItems' && prop !== 'gap' && prop !== 'width' && prop !== 'height',
})<FlexContainerProps>(({ center = false, fullWidth = false, flexDirection = 'row', fullHeight = false, justifyContent, alignItems, gap, width, height }) => ({
  display: 'flex',
  flexDirection,
  ...(center && { alignItems: 'center' }),
  ...(center && { justifyContent: 'center' }),
  ...(alignItems && { alignItems }),
  ...(justifyContent && { justifyContent }),
  ...(fullWidth && { width: '100%' }),
  ...(fullHeight && { height: '100%' }),
  ...(width && { width }),
  ...(height && { height }),
  padding: '0',
  margin: '0',
  ...(gap && { gap: `${gap}rem` }),
}));
