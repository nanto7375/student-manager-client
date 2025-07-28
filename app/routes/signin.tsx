import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Box } from "@mui/system";
import { grey } from "@mui/material/colors";
import { Button, Checkbox, TextField } from "@mui/material";

import { ROUTES } from "~/constants";
import { STORAGE_KEYS, TITLE } from "~/constants";
import { convertKoreanToEnglish, emailRegex, removeSpace } from "~/utils/string-util";
import { UNAUTHORIZED_ERRROR_CODE } from "~/lib/error";
import { useAuth } from "~/providers/use-auth";
import { FlexBox, FlexContainer } from "~/components/styled-elements";

const FAILED_CODES = {
  authenticationFailed: {
    code: UNAUTHORIZED_ERRROR_CODE,
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  },
};

const SIGNIN_INPUT_FIELD_WIDTH = '18rem';

const validateEmail = (value: string) => emailRegex.test(value);
const validatePassword = (value: string) => value.length >= 4 && value.length <= 16;
const validateInput = (id: string, password: string) => validateEmail(id) && validatePassword(password);

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = React.useMemo(() => {
    const _redirect = new URLSearchParams(location.search).get('redirect');
    return _redirect ? decodeURIComponent(_redirect) : '';
  }, [location.search]);

  const { signin } = useAuth();

  const savedEmail = React.useMemo(() => localStorage.getItem(STORAGE_KEYS.SAVED_EMAIL), []);
  const [email, setEmail] = React.useState(savedEmail || '');
  const [password, setPassword] = React.useState('');
  const [isSaveEmail, setIsSaveEmail] = React.useState(savedEmail !== null);
  const [signinButtonActive, setSigninButtonActive] = React.useState(false);
  const [inputError, setInputError] = React.useState({hasError: false, message: ''});

  React.useEffect(() => {
    return () => {
      inputError.hasError && setInputError({ hasError: false, message: '' });
      setSigninButtonActive(false);
      setPassword('');
    }
  }, [])

  const handleEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const _email = removeSpace(e.target.value);
    setEmail(_email);
    setSigninButtonActive(validateInput(_email, password));
  }, [password, isSaveEmail]);

  const handlePasswordChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const _password = convertKoreanToEnglish(removeSpace(e.target.value));
    setPassword(_password);
    setSigninButtonActive(validateInput(email, _password));
  }, [email]);

  const handleSignIn = React.useCallback(async () => {
    if (isSaveEmail) localStorage.setItem(STORAGE_KEYS.SAVED_EMAIL, email);
    if (!validateEmail(email) || !validatePassword(password)) return;
    try {
      await signin(email, password);
      navigate(redirect || ROUTES.HOME);
    } catch (error: any) {
      if (error.code === FAILED_CODES.authenticationFailed.code) {
        setInputError({ hasError: true, message: FAILED_CODES.authenticationFailed.message });
      }
    }
  }, [email, password]);

  const handleSaveEmail = React.useCallback((saved: boolean) => {
    if (saved) localStorage.setItem(STORAGE_KEYS.SAVED_EMAIL, email); 
    else localStorage.removeItem(STORAGE_KEYS.SAVED_EMAIL);
    setIsSaveEmail(saved);  
  }, [email]);

  return (
    <FlexContainer center fullWidth fullHeight>
      <FlexBox
        className="outliner"
        center
        shadowOn
        sx={{
          flexDirection: 'column',
          width: '30rem',
          height: '25rem',
          border: `1px solid ${grey[300]}`,
          borderRadius: '1rem',
        }}
      >
        <Box
          className="title"
          sx={{
            marginBottom: '2.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            display: 'inline-block',
            lineHeight: 1,
          }}
          onClick={() => navigate(ROUTES.HOME)}
        >
          <h1 style={{ margin: 0 }}>
            <Box component="span" sx={{ color: 'primary.main' }}>
              {TITLE.kor}
            </Box>
          </h1>
        </Box>

        <Box className="input-wrapper">
          <FlexBox>
            <TextField
              id="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              sx={{ 
                width: SIGNIN_INPUT_FIELD_WIDTH,
                '& .MuiOutlinedInput-root': {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }
              }}
              variant="outlined"
            />
          </FlexBox>
          <FlexBox center>
            <TextField
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              sx={{ 
                width: SIGNIN_INPUT_FIELD_WIDTH,
                marginTop: '-1px',
                '& .MuiOutlinedInput-root': {
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                }
              }}
              variant="outlined"
            />
          </FlexBox>
          <FlexBox
            className="save-email-checkbox-wrapper"
            justifyContent="flex-start"
            alignItems="center"
            sx={{ width: SIGNIN_INPUT_FIELD_WIDTH, cursor: 'pointer' }}
            onClick={() => handleSaveEmail(!isSaveEmail)}
          >
            <Checkbox checked={isSaveEmail} />
            <Box component="span" sx={{ fontSize: '0.9rem', color: grey[600] }}>
              Email 저장
            </Box>
          </FlexBox>
        </Box>

        <Box className="signin-button-wrapper">
          {inputError.hasError && (
            <FlexBox
              className="authentication-error"
              sx={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', paddingLeft: '0.5rem' }}
            >
              {inputError.message}
            </FlexBox>
          )}
          <Button
            className="signin-button" //
            variant="contained"
            color="secondary"
            disabled={!signinButtonActive}
            sx={{ marginTop: '1rem', width: SIGNIN_INPUT_FIELD_WIDTH }}
            onClick={handleSignIn}
          >
            로그인
          </Button>
        </Box>
      </FlexBox>
    </FlexContainer>
  );
}