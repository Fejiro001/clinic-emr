import type { OutpatientVisit } from "../../types/supabase";

const OutpatientTab = ({ visits }: { visits: OutpatientVisit[] }) => (
  <div className="space-y-4">
    {visits.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No outpatient visits</p>
    ) : (
      visits.map((visit) => (
        <div
          key={visit.id}
          className="border border-gray-200 rounded-lg p-4 bg-white"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-900">Outpatient Visit</h3>
            <span className="text-xs text-gray-500">
              {new Date(visit.visit_date).toLocaleDateString()} at{" "}
              {visit.visit_time}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">History:</span>{" "}
              <span className="font-medium">{visit.history}</span>
            </div>
            <div>
              <span className="text-gray-600">Diagnosis:</span>{" "}
              <span className="font-medium">{visit.diagnosis}</span>
            </div>
            <div>
              <span className="text-gray-600">Treatment:</span>{" "}
              <span className="font-medium">{visit.treatment}</span>
            </div>
            {visit.notes && (
              <div>
                <span className="text-gray-600">Notes:</span>{" "}
                <span className="font-medium">{visit.notes}</span>
              </div>
            )}
          </div>
        </div>
      ))
    )}
  </div>
);

export default OutpatientTab;