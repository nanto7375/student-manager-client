import { Box, type BoxProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { type AlignItems, type FlexDirection, type JustifyContent } from './flex-container';

export interface FlexBoxProps extends BoxProps {
  center?: boolean;
  shadowOn?: boolean;
  flexDirection?: FlexDirection;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
  height?: string | number;
  width?: string | number;
  gap?: number;
  button?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  margin?: string;
  padding?: string;
}

export const FlexBox = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'shadowOn' &&
    prop !== 'center' &&
    prop !== 'flexDirection' &&
    prop !== 'alignItems' &&
    prop !== 'justifyContent' &&
    prop !== 'height' &&
    prop !== 'width' &&
    prop !== 'gap' &&
    prop !== 'button' &&
    prop !== 'fullWidth' &&
    prop !== 'fullHeight' &&
    prop !== 'margin' &&
    prop !== 'padding',
})<FlexBoxProps>(({ shadowOn = false, center = false, flexDirection = 'row', alignItems, justifyContent, height, width, gap, button, fullWidth, fullHeight, margin, padding }) => ({
  display: 'flex',
  flexDirection,
  ...(center && { alignItems: 'center' }),
  ...(center && { justifyContent: 'center' }),
  ...(alignItems && { alignItems }),
  ...(justifyContent && { justifyContent }),
  ...(gap && { gap: `${gap}rem` }),

  ...(height && { height, minHeight: height }),
  ...(width && { width, minWidth: width }),
  ...(fullHeight && { height: '100%' }),
  ...(fullWidth && { width: '100%' }),

  padding: padding || '0',
  margin: margin || '0',

  boxShadow: shadowOn ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none',
  ...(shadowOn && { padding: '0.5rem 1rem' }),
  ...(button && { cursor: 'pointer' }),
}));
