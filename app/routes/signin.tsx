import { useMutation } from "@tanstack/react-query";
import React from "react";
import { SAVED_ID_KEY } from "~/constants/local-storage-key";
import { buildApi } from "~/lib/api-builder";
import { convertKoreanToEnglish, emailRegex, removeSpace } from "~/utils/string-util";

const AUTHENTICATION_FAILED_CODE = 4012;

const INPUT_STYLE = 'border border-gray-300 p-2 w-60';

const validateEmail = (value: string) => emailRegex.test(value);
const validatePassword = (value: string) => value.length >= 4 && value.length <= 16;
const validateInput = (id: string, password: string) => validateEmail(id) && validatePassword(password);

const signinApi = buildApi({ url: '/auth/signin', method: 'POST' });

export default function SignIn() {
  const savedId = localStorage.getItem(SAVED_ID_KEY);
  const [email, setEmail] = React.useState(savedId || '');
  const [password, setPassword] = React.useState('');
  const [isSaveEmail, setIsSaveEmail] = React.useState(savedId !== null);
  const [inputError, setInputError] = React.useState({hasError: false, message: ''});
  const [signinButtonActive, setSigninButtonActive] = React.useState(false);

  const signin = useMutation({ mutationFn: (body: { email: string; password: string }) => signinApi({ body }) });

  const handleEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const _email = removeSpace(e.target.value);
    setEmail(_email);
    setSigninButtonActive(validateInput(_email, password));
    if (isSaveEmail) localStorage.setItem(SAVED_ID_KEY, _email);
  }, [password, isSaveEmail]);

  const handlePasswordChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const _password = convertKoreanToEnglish(removeSpace(e.target.value));
    setPassword(_password);
    setSigninButtonActive(validateInput(email, _password));
  }, [email]);

  const handleSignIn = React.useCallback(async () => {
    if (!validateEmail(email) || !validatePassword(password)) return;
    try {
      const result = await signin.mutateAsync({ email, password });
      inputError.hasError && setInputError({ hasError: false, message: '' });
    } catch (error: any) {
      if (error.code === AUTHENTICATION_FAILED_CODE) {
        setInputError({ hasError: true, message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
      }
    }
  }, [email, password]);

  const handleSaveEmail = React.useCallback((saved: boolean) => {
    if (saved) localStorage.setItem(SAVED_ID_KEY, email); 
    else localStorage.removeItem(SAVED_ID_KEY);
    setIsSaveEmail(saved);
  }, [email]);

  return (
    <div className="signin-container flex flex-col h-screen w-screen items-center justify-center gap-6">
      <div className="signin-header text-2xl font-bold flex items-center">
        <span className="leo-green-text">레오의&nbsp;서재</span>
        <span className="leo-brown-text">&nbsp;Leo's&nbsp;Study</span>
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