import { green, brown, grey } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    appleSDGothicNeoEB: React.CSSProperties;
    appleSDGothicNeoB: React.CSSProperties;
    appleSDGothicNeoM: React.CSSProperties;
    appleSDGothicNeoR: React.CSSProperties;
    sfUiDisplayM: React.CSSProperties;
    notoSansCJKkrM: React.CSSProperties;
    notoSansCJKkrEB: React.CSSProperties;
    notoSansCJKkrB: React.CSSProperties;
    notoSansCJKkrR: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    appleSDGothicNeoEB?: React.CSSProperties;
    appleSDGothicNeoB?: React.CSSProperties;
    appleSDGothicNeoM?: React.CSSProperties;
    appleSDGothicNeoR?: React.CSSProperties;
    sfUiDisplayM?: React.CSSProperties;
    notoSansCJKkrM?: React.CSSProperties;
    notoSansCJKkrEB?: React.CSSProperties;
    notoSansCJKkrB?: React.CSSProperties;
    notoSansCJKkrR?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    appleSDGothicNeoEB: true;
    appleSDGothicNeoB: true;
    appleSDGothicNeoM: true;
    appleSDGothicNeoR: true;
    sfUiDisplayM: true;
    notoSansCJKkrM: true;
    notoSansCJKkrEB: true;
    notoSansCJKkrB: true;
    notoSansCJKkrR: true;
  }
}

const appleSDGothicNeoEB = {
  fontFamily: 'AppleSDGothicNeo-EB, "Noto Sans CJK KR-EB", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize: '1rem',
  lineHeight: 1.5,
  fontWeight: 800,
};
const appleSDGothicNeoB = {
  fontFamily: 'AppleSDGothicNeo-B, "Noto Sans CJK KR-B", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize: '1rem',
  lineHeight: 1.5,
  fontWeight: 700,
};
const appleSDGothicNeoM = {
  fontFamily: 'AppleSDGothicNeo-M, "Noto Sans CJK KR-M", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize: '1rem',
  lineHeight: 1.5,
  fontWeight: 500,
};
const appleSDGothicNeoR = {
  fontFamily: 'AppleSDGothicNeo-R, "Noto Sans CJK KR-R", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize: '1rem',
  lineHeight: 1.5,
  fontWeight: 400,
};

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 3000,
      sm: 3000,
      md: 3000,
      lg: 3000,
      xl: 3000,
    },
  },
  typography: {
    fontFamily: 'AppleSDGothicNeo-M, "Noto Sans CJK KR-M", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
    appleSDGothicNeoEB,
    appleSDGothicNeoB,
    appleSDGothicNeoM,
    appleSDGothicNeoR,
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { severity: 'info' },
              style: {
                backgroundColor: '#60a5fa',
              },
            },
          ],
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#036635',
    },
    secondary: {
      main: brown[600],
    },
    grey: {
      500: grey[500],
    }
  },
});

export default theme;
