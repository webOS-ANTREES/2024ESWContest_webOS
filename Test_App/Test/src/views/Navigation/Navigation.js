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
      <Link to="/automation">
        <Button className={css.button}>자동화</Button>
      </Link>
      <Link to="/alerts">
        <Button className={css.button}>알림</Button>
      </Link>
      <Link to="/report">
        <Button className={css.button}>리포트</Button>
      </Link>
    </div>
  )
});

export default Navigation;
