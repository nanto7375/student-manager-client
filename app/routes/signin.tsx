import React from "react";
import { STORAGE_KEYS, TITLE } from "~/constants";
import { convertKoreanToEnglish, emailRegex, removeSpace } from "~/utils/string-util";
import { useLocation, useNavigate } from "react-router";
import { ROUTES } from "~/constants";
import { UNAUTHORIZED_ERRROR_CODE } from "~/lib/error";
import { useAuth } from "~/providers/use-auth";

const FAILED_CODES = {
  authenticationFailed: {
    code: UNAUTHORIZED_ERRROR_CODE,
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  },
};

const INPUT_STYLE = 'border border-gray-300 p-2 w-60';

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
    if (isSaveEmail) localStorage.setItem(STORAGE_KEYS.SAVED_EMAIL, _email);
  }, [password, isSaveEmail]);

  const handlePasswordChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const _password = convertKoreanToEnglish(removeSpace(e.target.value));
    setPassword(_password);
    setSigninButtonActive(validateInput(email, _password));
  }, [email]);

  const handleSignIn = React.useCallback(async () => {
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
    <div className="signin-container flex flex-col h-screen w-screen items-center justify-center gap-6">
      <div className="signin-header text-2xl font-bold flex items-center">
        <span className="leo-green-text">{TITLE.kor}</span>
        <span className="leo-brown-text">&nbsp;{TITLE.eng}</span>
      </div>

      <div className="signin-form flex flex-col items-center justify-center rounded-lg border border-gray-300 pt-8 pb-8 pl-12 pr-12 gap-6">
        <div className="input-wrapper flex flex-col">
          <input 
            id="email" 
            type="text" 
            className={`${INPUT_STYLE} rounded-t-md rounded-b-none`} 
            value={email} 
            onChange={handleEmailChange} 
            placeholder="이메일"
          />
          <input 
            id="password" 
            type="password" 
            className={`${INPUT_STYLE} -mt-px rounded-t-none rounded-b-md`} 
            value={password} 
            onChange={handlePasswordChange} 
            placeholder="비밀번호"
          />

          <div className="save-id-wrapper mt-4 flex items-center gap-2">
            <input type="checkbox" id="save-email" className="w-4 h-4 border border-gray-300 rounded-md align-middle -mt-1" checked={isSaveEmail} onChange={() => handleSaveEmail(!isSaveEmail)} />
            <label htmlFor="save-email" className="text-sm text-gray-500 cursor-pointer align-middle">이메일 저장</label>
          </div>
        </div>

        <div className="signin-button-wrapper flex flex-col items-center justify-center gap-3">
          {inputError.hasError && (
            <div className="">
              <span className="text-red-500 text-sm">{inputError.message}</span>
            </div>
          )}

          <button 
            className={`leo-green-bg p-2 rounded-md w-60 ${signinButtonActive ? 'opacity-100' : 'opacity-50'}`} 
            disabled={!signinButtonActive}
            onClick={handleSignIn}
          >
            <span className="text-white">로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
}