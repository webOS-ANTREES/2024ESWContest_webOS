import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@enact/moonstone/Button';
import Input from '@enact/moonstone/Input';
import css from './Login.module.css';

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [id, setId] = useState('');  // id로 변수명 수정
  const [password, setPassword] = useState('');  // password로 변수명 유지
  const [error, setError] = useState('');

  // ID와 PW 변경 핸들러
  const handleIDChange = (e) => setId(e.value);
  const handlePWChange = (e) => setPassword(e.value);

  // 로그인 버튼 클릭 시 호출
  const handleLogin = () => {
    const validID = '';  // 유효한 ID 설정
    const validPW = '';  // 유효한 PW 설정

    if (id === validID && password === validPW) {
      setIsAuthenticated(true);
      navigate('/menu');  // 로그인 성공 시 경로 이동
    } else {
      setError('아이디/비밀번호를 확인해주십시오');
    }
  };

  return (
    <div className={css.loginContainer}>
      <img src="/Berry Smart Farm.png" alt="logo" className={css.logo} />
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
      {error && <div className={css.error}>{error}</div>}
      <Button onClick={handleLogin} className={css.button}>
        Login
      </Button>
    </div>
  );
};

export default Login;
