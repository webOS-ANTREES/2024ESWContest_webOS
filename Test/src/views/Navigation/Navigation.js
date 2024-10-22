import kind from '@enact/core/kind';
import { Link } from 'react-router-dom';
import Button from '@enact/moonstone/Button';
import css from './Navigation.module.css';

const Navigation = kind({
  name: 'Navigation',
  render: () => (
    <div className={css.navigationContainer}>
      <Link to="/monitoring">
        <Button className={css.button}>모니터링</Button>
      </Link>
      <Link to="/PestManagement">
        <Button className={css.button}>병해충 관리</Button>
      </Link>
      <Link to="/SystemControl">
        <Button className={css.button}>시스템 제어</Button>
      </Link>
      <Link to="/notice">
        <Button className={css.button}>알림</Button>
      </Link>
    </div>
  )
});

export default Navigation;
