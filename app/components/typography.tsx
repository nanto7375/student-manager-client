import { Typography, type TypographyProps } from '@mui/material';

/** Typography wrapper - 테마 기본 폰트(Apple SD Gothic Neo-M) 적용 */
export const AppleTg = ({ children, ...props }: { children: React.ReactNode } & TypographyProps) => (
  <Typography {...props}>{children}</Typography>
);
