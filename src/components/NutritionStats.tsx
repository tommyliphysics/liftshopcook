import { formatMilligrams } from '../lib/units.ts'
import type { ReportData } from '../lib/report.ts'

type NutritionStatsProps = {
  report: ReportData
}

function NutritionStats({ report }: NutritionStatsProps) {
  return (
    <>
      <div className="report-stats">
        <div className="report-stat">
          <span className="report-stat-label">Carbohydrates</span>
          <span className="report-stat-value">
            {report.avgCarbs.toFixed(1)} g
          </span>
        </div>
        <div className="report-stat">
          <span className="report-stat-label">Fat</span>
          <span className="report-stat-value">
            {report.avgFat.toFixed(1)} g
          </span>
        </div>
        <div className="report-stat">
          <span className="report-stat-label">Protein</span>
          <span className="report-stat-value">
            {report.avgProtein.toFixed(1)} g
          </span>
        </div>
      </div>

      {report.micronutrients.length > 0 && (
        <ul className="micronutrient-list">
          {report.micronutrients.map((m) => (
            <li key={m.name}>
              <span>{m.name}</span>
              <span>{formatMilligrams(m.amountMg)}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default NutritionStats
