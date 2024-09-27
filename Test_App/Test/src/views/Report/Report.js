import { kind } from '@enact/core/kind';
import css from './Report.module.css';

const Report = kind({
  name: 'Report',
  render: () => (
    <div className={css.reportContainer}>
      <div className={css.tableContainer}>
        <table className={css.reportTable}>
          <thead>
            <tr>
              <th>데이터 종류</th>
              <th>1월</th>
              <th>2월</th>
              <th>3월</th>
              <th>4월</th>
              <th>5월</th>
              <th>6월</th>
              <th>7월</th>
              <th>8월</th>
              <th>9월</th>
              <th>10월</th>
              <th>11월</th>
              <th>12월</th>
              <th>연평균</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>온도</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>습도</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>대기</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>조도</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>양액 온도</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>양액 pH</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={css.chartContainer}>
        <h2>농장 내부 온도 월별 차트</h2>
        <div className={css.chart}>
          {/* 차트를 표시할 영역, 여기서는 placeholder로 대체 */}
          <img src="path/to/chart.png" alt="Temperature Chart" />
        </div>
      </div>
    </div>
  )
});

export default Report;
