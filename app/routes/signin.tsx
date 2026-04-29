import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Box } from "@mui/system";
import { grey } from "@mui/material/colors";
import { Button, Checkbox, TextField } from "@mui/material";

import { ROUTES } from "~/constants";
import { LEO_TITLE } from "~/constants";
import { convertKoreanToEnglish, emailRegex, removeSpace } from "~/lib/utils/string.util";
import { UNAUTHORIZED_ERRROR_CODE } from "~/lib/error";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { auth } from "~/lib/auth";

const SIGNIN_INPUT_FIELD_WIDTH = '18rem';
const SAVED_EMAIL_KEY = 'saved-email';
const SIGNIN_ERROR_CASES = {
  authenticationFailed: {
    code: UNAUTHORIZED_ERRROR_CODE,
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  },
};

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

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSaveEmail, setIsSaveEmail] = React.useState(false);
  const [signinButtonActive, setSigninButtonActive] = React.useState(false);
  const [inputError, setInputError] = React.useState({hasError: false, message: ''});

  // 이메일 저장 정보 불러오기
  React.useEffect(() => {
    const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setIsSaveEmail(true);
    }
  }, []);

  // 페이지 벗어날 때, 필드 초기화
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
    if (isSaveEmail) localStorage.setItem(SAVED_EMAIL_KEY, email);
    if (!validateEmail(email) || !validatePassword(password)) return;
    try {
      await auth.signin(email, password);
      navigate(redirect || ROUTES.HOME);
    } catch (error: any) {
      if (error.code === SIGNIN_ERROR_CASES.authenticationFailed.code) {
        setInputError({ hasError: true, message: SIGNIN_ERROR_CASES.authenticationFailed.message });
      }
    }
  }, [email, password, isSaveEmail, redirect]);

  const handleSaveEmail = React.useCallback((isSave: boolean) => {
    if (!isSave) localStorage.removeItem(SAVED_EMAIL_KEY);
    // 스토리지에 이메일 저장은 확인 버튼 누를 때 동작
    setIsSaveEmail(isSave);  
  }, []);

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
              {LEO_TITLE.kor}
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
                  '& fieldset legend': {
                    display: 'none',
                  }
                }
              }}
              variant="outlined"
            />
          </FlexBox>
          <FlexBox center sx={{ marginTop: '4px' }}>
            <TextField
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              sx={{
                width: SIGNIN_INPUT_FIELD_WIDTH,
                '& .MuiOutlinedInput-root': {
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  '& fieldset legend': {
                    display: 'none',
                  }
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