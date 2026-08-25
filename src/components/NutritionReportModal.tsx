import Modal from './Modal.tsx'
import NutritionStats from './NutritionStats.tsx'
import type { ReportData } from '../lib/report.ts'

type NutritionReportModalProps = {
  open: boolean
  onClose: () => void
  report: ReportData
}

function NutritionReportModal({
  open,
  onClose,
  report,
}: NutritionReportModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      titleId="nutrition-report-title"
      title="Nutrition / Day"
    >
      <NutritionStats report={report} />

      <button
        type="button"
        className="btn btn-primary btn-full"
        onClick={onClose}
      >
        Done
      </button>
    </Modal>
  )
}

export default NutritionReportModal
