import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpdatabase } from '../Firebase/Firebase';  // Firebase에서 signUp 데이터베이스 가져오기
import { ref, set, get } from "firebase/database";  // Firebase Realtime Database 함수 사용
import Button from '@enact/moonstone/Button';
import Input from '@enact/moonstone/Input';
import signUpIcon from '../../../resources/images/SignUp.png';
import css from './SignUp.module.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [id, setId] = useState('');  // 아이디 상태
  const [password, setPassword] = useState('');  // 비밀번호 상태
  const [confirmPassword, setConfirmPassword] = useState('');  // 비밀번호 확인 상태
  const [name, setName] = useState('');  // 이름 상태
  const [idErrorMessage, setIdErrorMessage] = useState('');  // ID 관련 에러 메시지 상태
  const [nameErrorMessage, setNameErrorMessage] = useState('');  // 이름 관련 에러 메시지 상태
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');  // 비밀번호 관련 에러 메시지 상태
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');  // 비밀번호 확인 에러 메시지
  const [isIdChecked, setIsIdChecked] = useState(false);  // 아이디 중복 확인 여부
  const [isIdAvailable, setIsIdAvailable] = useState(false);  // ID 사용 가능 여부

  // ID, PW, 이름 입력 핸들러
  const handleIDChange = (e) => {
    setId(e.value);
    setIsIdChecked(false);  // 아이디가 변경되면 중복 확인 초기화
    setIdErrorMessage('');  // 새로운 입력 시 에러 메시지 초기화
    setIsIdAvailable(false);  // 사용 가능 여부 초기화
  };

  const handlePWChange = (e) => {
    setPassword(e.value);
    setPasswordErrorMessage('');  // 새로운 입력 시 에러 메시지 초기화
  };

  const handleConfirmPWChange = (e) => {
    setConfirmPassword(e.value);
    setConfirmPasswordErrorMessage('');  // 새로운 입력 시 에러 메시지 초기화
  };

  const handleNameChange = (e) => {
    setName(e.value);
    setNameErrorMessage('');  // 새로운 입력 시 에러 메시지 초기화
  };

  // 아이디 중복 검사
  const handleCheckId = () => {
    if (id.trim() === '') {
      setIdErrorMessage('ID를 입력해 주세요.');
      return;
    }
    const userRef = ref(signUpdatabase, 'Users/' + id);

    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        setIdErrorMessage('이미 사용 중인 ID입니다. 다른 ID를 입력해 주세요.');
        setIsIdChecked(false);  // 중복된 아이디
        setIsIdAvailable(false);  // 사용 불가
      } else {
        setIdErrorMessage('사용 가능한 ID입니다.');
        setIsIdChecked(true);  // 중복이 아닌 경우
        setIsIdAvailable(true);  // 사용 가능
      }
    }).catch(() => {
      setIdErrorMessage('아이디 중복 확인 중 오류가 발생했습니다.');
    });
  };

  // 회원가입 처리 함수
  const handleSignUp = () => {
    // 개별 입력란 확인
    if (name.trim() === '') {
      setNameErrorMessage('이름을 입력해 주세요.');
      return;
    }

    if (id.trim() === '') {
      setIdErrorMessage('ID를 입력해 주세요.');
      return;
    }

    if (!isIdChecked) {
      setIdErrorMessage('ID 중복 확인을 해주세요.');
      return;
    }

    if (password.trim() === '') {
      setPasswordErrorMessage('비밀번호를 입력해 주세요.');
      return;
    }

    if (confirmPassword.trim() === '') {
      setConfirmPasswordErrorMessage('비밀번호 확인을 입력해 주세요.');
      return;
    }

    // 비밀번호와 비밀번호 확인이 일치하지 않으면 에러 메시지 출력
    if (password !== confirmPassword) {
      setConfirmPasswordErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    // Firebase에 ID, PW, 이름 저장
    const userRef = ref(signUpdatabase, 'Users/' + id);

    set(userRef, {
      id: id,
      password: password,
      name: name
    })
      .then(() => {
        setIdErrorMessage('');  // 성공적으로 가입되면 에러 메시지 초기화
        setNameErrorMessage('');
        setPasswordErrorMessage('');
        setConfirmPasswordErrorMessage('');
        navigate('/');  // 회원가입 후 로그인 페이지로 이동
      })
      .catch(() => {
        setIdErrorMessage('회원가입 중 오류가 발생했습니다.');
      });
  };

  // 취소 버튼 클릭 시 로그인 페이지로 이동하는 함수
  const handleCancel = () => {
    navigate('/');  // 로그인 페이지로 돌아가기
  };

  return (
    <div className={css.signupContainer}>
      <img src={signUpIcon} alt="회원 가입 아이콘" className={css.signupIcon} />

      <div className={css.formContainer}>
        <div className={css.inputContainer}>
          <Input
            placeholder="이름"
            value={name}
            onChange={handleNameChange}
            className={css.input}
          />
          {nameErrorMessage && <div className={css.error}>{nameErrorMessage}</div>}
        </div>

        <div className={css.inputContainer}>
          <Input
            placeholder="ID"
            value={id}
            onChange={handleIDChange}
            className={css.input}
          />
          {idErrorMessage && (
            <div className={isIdAvailable ? css.success : css.error}>
              {idErrorMessage}
            </div>
          )}
        </div>

        <div className={css.inputContainer}>
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={handlePWChange}
            className={css.input}
          />
          {passwordErrorMessage && <div className={css.error}>{passwordErrorMessage}</div>}
        </div>

        <div className={css.inputContainer}>
          <Input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={handleConfirmPWChange}
            className={css.input}
          />
          {confirmPasswordErrorMessage && <div className={css.error}>{confirmPasswordErrorMessage}</div>}
        </div>
      </div>

      <div className={css.idButtonContainer}>
        <Button onClick={handleCheckId} className={css.idButton}>
          중복 검사
        </Button>
      </div>

      <div className={css.buttonWrapper}>
        <Button onClick={handleSignUp} className={css.button}>
          등록
        </Button>
        <Button onClick={handleCancel} className={css.button}>
          취소
        </Button>
      </div>
    </div>
  );
};

export default SignUp;
