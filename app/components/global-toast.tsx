import React from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import { type SlideProps } from '@mui/material/Slide';
import { type ToastMessage } from '~/hooks/use-toast';

interface GlobalToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

export default function GlobalToast({ toasts, onRemove }: GlobalToastProps) {
  return (
    <>
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.autoHideDuration}
          onClose={() => onRemove(toast.id)}
          anchorOrigin={{ vertical: 'top', horizontal: toast.autoHideDuration >= 5000 ? 'right' : 'center' }}
          slots={{transition: SlideTransition}}
          sx={{
            top: `${(index * 3.75) + 1.25}rem`,
            '& .MuiSnackbarContent-root': {
              minWidth: 'auto',
              fontSize: '0.875rem',
            }
          }}
        >
          <Alert
            onClose={() => onRemove(toast.id)}
            variant="filled"
            severity={toast.type}
            sx={{ padding: '0.5rem 1rem' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
} 