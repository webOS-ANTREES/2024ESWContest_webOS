import kind from '@enact/core/kind';
import { Panel } from '@enact/moonstone/Panels';
import { Link } from 'react-router-dom';
import Button from '@enact/moonstone/Button';
import css from './MainPanel.module.css';

const MainPanel = kind({
  name: 'MainPanel',
  render: (props) => (
    <Panel>
      <div className={css.mainContainer}>
        <div className={css.menu}>
          <Link to="/monitoring">
            <Button>모니터링</Button>
          </Link>
          <Link to="/automation">
            <Button>자동화</Button>
          </Link>
          <Link to="/alerts">
            <Button>알림</Button>
          </Link>
          <Link to="/report">
            <Button>리포트</Button>
          </Link>
        </div>
        {props.children}
      </div>
    </Panel>
  )
});

export default MainPanel;
