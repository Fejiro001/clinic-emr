import type { InpatientRecord, Operation } from "../../types/supabase";

const InpatientTab = ({
  records,
  operations,
}: {
  records: InpatientRecord[];
  operations: Operation[];
}) => (
  <div className="space-y-4">
    {records.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No inpatient records</p>
    ) : (
      records.map((record) => (
        <div
          key={record.id}
          className="border border-gray-200 rounded-lg p-4 bg-white"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-900">{record.ward} Ward</h3>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                record.date_of_discharge
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {record.date_of_discharge ? "Discharged" : "Currently Admitted"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Admission:</span>{" "}
              <span className="font-medium">
                {new Date(record.date_of_admission).toLocaleDateString()}
              </span>
            </div>
            {record.date_of_discharge && (
              <div>
                <span className="text-gray-600">Discharge:</span>{" "}
                <span className="font-medium">
                  {new Date(record.date_of_discharge).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-gray-600">Diagnosis:</span>{" "}
              <span className="font-medium">{record.prov_diagnosis}</span>
            </div>
          </div>

          {/* Show operations for this admission */}
          {operations.filter((op) => op.inpatient_record_id === record.id)
            .length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Operations:
              </h4>
              <div className="space-y-2">
                {operations
                  .filter((op) => op.inpatient_record_id === record.id)
                  .map((op) => (
                    <div key={op.id} className="text-sm bg-red-50 p-2 rounded">
                      <span className="font-medium">{op.operation_name}</span> -{" "}
                      {new Date(op.operation_date).toLocaleDateString()}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ))
    )}
  </div>
);

export default InpatientTab;
