import { Modal, type ModalProps } from '@mui/material';
import { FlexBox, FlexContainer } from './styled-elements';
import { AppleTg } from './typography';
import { colors } from './index';

type ConfirmModalProps = {
  bodyText: string;
  onConfirm: () => void;
  onCancel: () => void;
} & Omit<ModalProps, 'children'>;

export const ConfirmModal = ({bodyText, onConfirm, onCancel, ...props}: ConfirmModalProps) => {
  return (
    <Modal 
      {...props} 
      sx={{ 
        outline: 'none',
        '&:focus': {outline: 'none'},
        '& *': {outline: 'none'},
        '& .MuiBackdrop-root': {
          outline: 'none'
        }
      }} 
      slotProps={{
        backdrop: { sx: { backgroundColor: 'transparent', outline: 'none' }}
      }}
    >
      <FlexContainer fullWidth fullHeight center onClick={onCancel}>
        <FlexBox flexDirection="column" width="20rem" center sx={{minHeight: '10rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)'}}>
          
          <FlexBox fullWidth center sx={{minHeight: '7rem', padding: '1rem'}}>
            <AppleTg sx={{fontSize: '1rem', color: 'black'}}>{bodyText}</AppleTg>
          </FlexBox>

          <FlexBox fullWidth height="3rem" alignItems="center" justifyContent="space-between">
            <FlexBox 
              width="40%" 
              fullHeight 
              center 
              button 
              onClick={onCancel} 
              sx={{ '&:hover': { '& .MuiTypography-root': { color: colors.red } }}}
            >
              <AppleTg>취소</AppleTg>
            </FlexBox>

            <FlexBox 
              width="40%" 
              fullHeight 
              center 
              button 
              onClick={onConfirm} 
              sx={{ '&:hover': { '& .MuiTypography-root': { color: colors.blue } }}}
            >
              <AppleTg>확인</AppleTg>
            </FlexBox>

          </FlexBox>
        </FlexBox>
      </FlexContainer>
    </Modal>
  );
}