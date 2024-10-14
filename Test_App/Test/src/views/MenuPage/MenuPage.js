import { Link } from 'react-router-dom';
import Button from '@enact/moonstone/Button';
import css from './MenuPage.module.css';

const MenuPage = () => {
  return (
    <div className={css.menuContainer}>
      <h1>메뉴</h1>
      <div className={css.buttonContainer}>
        <Link to="/monitoring">
          <Button className={css.button}>모니터링</Button>
        </Link>
        <Link to="/pestmanagement">
          <Button className={css.button}>병해충 관리</Button>
        </Link>
        <Link to="/systemcontrol">
          <Button className={css.button}>시스템 제어</Button>
        </Link>
        <Link to="/notice">
          <Button className={css.button}>알림</Button>
        </Link>
      </div>
    </div>
  );
};

export default MenuPage;