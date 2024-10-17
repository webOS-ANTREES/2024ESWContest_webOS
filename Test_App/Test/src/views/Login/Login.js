import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpdatabase } from '../../Firebase';  // Firebase에서 signUp 데이터베이스 가져오기
import { ref, get } from "firebase/database";  // Firebase Realtime Database 함수 사용
import Button from '@enact/moonstone/Button';
import Input from '@enact/moonstone/Input';
import css from './Login.module.css';
import logo from '../../../Berry Smart Farm.png';

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [id, setId] = useState('');  // id 상태
  const [password, setPassword] = useState('');  // password 상태
  const [errorMessage, setErrorMessage] = useState('');  // 에러 메시지 상태 (변수 이름 변경)

  // ID와 PW 변경 핸들러
  const handleIDChange = (e) => setId(e.value);  // e.target.value 대신 e.value 사용
  const handlePWChange = (e) => setPassword(e.value);  // e.target.value 대신 e.value 사용

  // 로그인 버튼 클릭 시 호출
  const handleLogin = () => {
    const userRef = ref(signUpdatabase, 'Users/' + id); // 'Users/{id}' 경로로 데이터 조회

    // 데이터베이스에서 사용자 정보 조회
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();

        // 입력된 비밀번호가 데이터베이스 비밀번호와 일치하는지 확인
        if (userData.password === password) {
          setIsAuthenticated(true);  // 로그인 성공
          navigate('/menu');  // 로그인 성공 시 메뉴 페이지로 이동
        } else {
          setErrorMessage('비밀번호가 올바르지 않습니다.');
        }
      } else {
        setErrorMessage('존재하지 않는 사용자 ID입니다.');
      }
    });
  };

  // 회원가입 페이지로 이동
  const handleSignUpRedirect = () => {
    navigate('/signup');  // 회원가입 페이지로 이동
  };

  return (
    <div className={css.loginContainer}>
      <img src={logo} alt="logo" className={css.logo} />
      <h1 className={css.title}>Login</h1>
      <Input
        placeholder="ID"
        value={id}
        onChange={handleIDChange}  // ID 변경 핸들러 연결
        className={css.input}
      />
      <Input
        type="password"
        placeholder="PW"
        value={password}
        onChange={handlePWChange}  // PW 변경 핸들러 연결
        className={css.input}
      />
      {errorMessage && <div className={css.error}>{errorMessage}</div>}
      <Button onClick={handleLogin} className={css.button}>
        Login
      </Button>

      {/* 회원가입 링크 버튼 */}
      <div className={css.signupLink}>
        <span>아직 계정이 없으신가요? </span>
        <button onClick={handleSignUpRedirect} className={css.signupButton}>
          회원가입
        </button>
      </div>
    </div>
  );
};

export default Login;