import { Typography, type TypographyProps } from '@mui/material';

export const AppleTg = ({children, ...props}: {children: React.ReactNode} & TypographyProps) => {
  return (
    <Typography variant="appleSDGothicNeoM" {...props}>
    {children}
    </Typography>
  );
}

