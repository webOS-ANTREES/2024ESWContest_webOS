import kind from '@enact/core/kind';
import css from './PestManagement.module.css'; // 정확한 파일 이름 사용

const PestManagement = kind({
  name: 'PestManagement',
  render: () => (
    <div className={css.PestManagementContainer}>
      <h1>PestManagement Page</h1>
      <div className={css.PestManagementContent}>
        <div className={css.PestManagementItem}>
          <h2>병해충 관리</h2>
          <p>Description of PestManagement item 1.</p>
        </div>
        <div className={css.PestManagementItem}>
          <h2>외벽 제어</h2>
          <p>Description of PestManagement item 2.</p>
        </div>
        {/* 추가적인 자동화 항목 */}
      </div>
    </div>
  )
});

export default PestManagement;