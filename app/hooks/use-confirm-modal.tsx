import React from "react";
import { Modal, type ModalProps } from '@mui/material';
import { FlexBox, FlexContainer } from '~/components/styled-elements';
import { AppleTg } from '~/components/typography';
import { colors } from '~/components/index';

type ConfirmModalProps = {
  width?: string;
  bodyText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode;
} 
// & Omit<ModalProps, 'children'>;

export const useConfirmModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const ConfirmModal = ({
    width = '20rem',
    onConfirm, 
    bodyText='', 
    onCancel = () => {}, 
    confirmText = '확인', 
    cancelText = '취소',
    children
  }: ConfirmModalProps) => {
    return (
      <Modal
        open={isOpen}
        disableRestoreFocus
        slotProps={{
          backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        }}
      >
        <FlexContainer fullWidth fullHeight center>
          <FlexBox flexDirection="column" width={width} center sx={{minHeight: '10rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)'}}>

            <FlexBox fullWidth center sx={{minHeight: '7rem', padding: '1rem'}}>
              {children ? children : <AppleTg>{bodyText}</AppleTg>}
            </FlexBox>

            <FlexBox fullWidth height="3.5rem" alignItems="center" justifyContent="space-between">
              <FlexBox
                width="40%"
                fullHeight
                center
                button
                onClick={() => {setIsOpen(false); onCancel();}}
                sx={{ '&:hover': { '& .MuiTypography-root': { color: colors.red } }}}
              >
                <AppleTg>{cancelText}</AppleTg>
              </FlexBox>

              <FlexBox
                width="40%"
                fullHeight
                center
                button
                onClick={onConfirm}
                sx={{ '&:hover': { '& .MuiTypography-root': { color: colors.blue } }}}
              >
                <AppleTg>{confirmText}</AppleTg>
              </FlexBox>

            </FlexBox>
          </FlexBox>
        </FlexContainer>
      </Modal>
    );
  };

  return { ConfirmModal, openConfirmModal: () => setIsOpen(true), closeConfirmModal: () => setIsOpen(false) };
}