import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@enact/moonstone/Button';
import Input from '@enact/moonstone/Input';
import css from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // 기본 사용자명과 비밀번호
    const validUsername = 'antrees';
    const validPassword = '12345';

    // 사용자명과 비밀번호를 검증
    if (username === validUsername && password === validPassword) {
      navigate('/monitoring'); // 로그인 성공 시 이동할 경로 설정
    } else {
      setError('아이디/비밀번호를 확인해주십시오');
    }
  };

  return (
    <div className={css.loginContainer}>
      <h1 className={css.title}>Login</h1>
      <Input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.value)}
        className={css.input}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.value)}
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
