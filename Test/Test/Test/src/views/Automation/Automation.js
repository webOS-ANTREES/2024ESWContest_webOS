import kind from '@enact/core/kind';
import css from './Automation.module.css';

const Automation = kind({
  name: 'Automation',
  render: () => (
    <div className={css.automationContainer}>
      <h1>Automation Page</h1>
      <div className={css.automationContent}>
        <div className={css.automationItem}>
          <h2>병해충 관리</h2>
          <p>Description of automation item 1.</p>
        </div>
        <div className={css.automationItem}>
          <h2>외벽 제어</h2>
          <p>Description of automation item 2.</p>
        </div>
        {/* 추가적인 자동화 항목 */}
      </div>
    </div>
  )
});

export default Automation;
