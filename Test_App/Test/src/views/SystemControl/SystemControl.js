import kind from '@enact/core/kind';
import css from './SystemControl.module.css';

const SystemControl = kind({
  name: 'SystemControl',
  render: () => (
    <div className={css.SystemControlContainer}>
      <h1>SystemControl Page</h1>
      <div className={css.SystemControlContent}>
        <div className={css.SystemControlItem}>
          <h2>병해충 관리</h2>
          <p>Description of SystemControl item 1.</p>
        </div>
        <div className={css.SystemControlItem}>
          <h2>외벽 제어</h2>
          <p>Description of SystemControl item 2.</p>
        </div>
        {/* 추가적인 자동화 항목 */}
      </div>
    </div>
  )
});

export default SystemControl;
