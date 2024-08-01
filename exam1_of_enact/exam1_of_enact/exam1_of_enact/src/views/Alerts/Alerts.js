import kind from '@enact/core/kind';
import css from './Alerts.module.css';

const Alerts = kind({
  name: 'Alerts',
  render: () => (
    <div className={css.alertsContainer}>
      <div className={css.alertList}>
        <h2>알림</h2>
        <ul>
          {/* 알림 리스트 */}
        </ul>
      </div>
      <div className={css.alertDetails}>
        <h2>메시지 세부 정보</h2>
        {/* 메시지 세부 정보 표시 */}
      </div>
    </div>
  )
});

export default Alerts;
