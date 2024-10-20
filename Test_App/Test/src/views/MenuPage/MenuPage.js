import { Link } from 'react-router-dom';
import monitoringIcon from './Monitoring.gif';
import pestmanagementlIcon from './PestManagement.gif';
import systemcontrolIcon from './SystemControl.gif';
import noticeIcon from './Notice.gif';
import css from './MenuPage.module.css';

const MenuPage = ({ userName }) => {
  return (
    <div className={css.menuContainer}>
      <div className={css.header}>
        <h1 className={css.welcomeText}>환영합니다! {userName}님</h1>
      </div>

      <div className={css.buttonContainer}>
        <Link to="/monitoring" style={{ textDecoration: 'none' }}>
          <div className={css.buttonWrapper}>
            <img src={monitoringIcon} alt="모니터링" className={css.icon} />
          </div>
          <div className={css.iconLabel}>모니터링</div>
        </Link>

        <Link to="/pestmanagement" style={{ textDecoration: 'none' }}>
          <div className={css.buttonWrapper}>
            <img src={pestmanagementlIcon} alt="병해충 관리" className={css.icon} />
          </div>
          <div className={css.iconLabel}>병해충 관리</div>
        </Link>

        <Link to="/systemcontrol" style={{ textDecoration: 'none' }}>
          <div className={css.buttonWrapper}>
            <img src={systemcontrolIcon} alt="시스템 제어" className={css.icon} />
          </div>
          <div className={css.iconLabel}>시스템 제어</div>
        </Link>

        <Link to="/notice" style={{ textDecoration: 'none' }}>
          <div className={css.buttonWrapper}>
            <img src={noticeIcon} alt="알림" className={css.icon} />
          </div>
          <div className={css.iconLabel}>알림</div>
        </Link>
      </div>
    </div>
  );
};

export default MenuPage;