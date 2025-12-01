import type { InpatientRecord, Operation } from "../../types/supabase";

const OperationsTab = ({
  operations,
  inpatientRecords,
}: {
  operations: Operation[];
  inpatientRecords: InpatientRecord[];
}) => (
  <div className="space-y-4">
    {operations.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No operations recorded</p>
    ) : (
      operations.map((op) => {
        const admission = inpatientRecords.find(
          (r) => r.id === op.inpatient_record_id
        );
        return (
          <div
            key={op.id}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900">
                {op.operation_name}
              </h3>
              <span className="text-xs text-gray-500">
                {new Date(op.operation_date).toLocaleDateString()}
              </span>
            </div>
            {admission && (
              <div className="text-sm text-gray-600 mb-2">
                Related to admission: {admission.ward} Ward
              </div>
            )}
            {op.notes && (
              <div className="text-sm">
                <span className="text-gray-600">Notes:</span>{" "}
                <span className="font-medium">{op.notes}</span>
              </div>
            )}
          </div>
        );
      })
    )}
  </div>
);

export default OperationsTab;
