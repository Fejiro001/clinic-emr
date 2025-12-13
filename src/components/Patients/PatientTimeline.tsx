import { useState, useEffect } from "react";
import {
  Calendar,
  Stethoscope,
  Scissors,
  ChevronDown,
  ChevronUp,
  Hospital,
} from "lucide-react";
import type {
  InpatientRecord,
  OutpatientVisit,
  Operation,
} from "../../types/supabase";
import { formatDate } from "../../utils/dateUtils";

interface TimelineEvent {
  id: string;
  type: "inpatient" | "outpatient" | "operation";
  date: string;
  time?: string;
  title: string;
  description: string;
  status?: string;
  details: InpatientRecord | OutpatientVisit | Operation;
}

interface PatientTimelineProps {
  patientId: string;
  inpatientRecords: InpatientRecord[];
  outpatientVisits: OutpatientVisit[];
  operations: Operation[];
}

const PatientTimeline = ({
  inpatientRecords,
  outpatientVisits,
  operations,
}: PatientTimelineProps) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "inpatient" | "outpatient" | "operation"
  >("all");

  useEffect(() => {
    // Combine all records into timeline events
    const timeline: TimelineEvent[] = [];

    // Add inpatient records
    inpatientRecords.forEach((record) => {
      timeline.push({
        id: `inpatient-${record.id}`,
        type: "inpatient",
        date: record.date_of_admission,
        title: `Admission - ${record.ward} Ward`,
        description: record.prov_diagnosis,
        status: record.date_of_discharge ? "Discharged" : "Currently Admitted",
        details: record,
      });
    });

    // Add outpatient visits
    outpatientVisits.forEach((visit) => {
      timeline.push({
        id: `outpatient-${visit.id}`,
        type: "outpatient",
        date: visit.visit_date,
        time: visit.visit_time,
        title: "Outpatient Visit",
        description: visit.diagnosis,
        details: visit,
      });
    });

    // Add operations
    operations.forEach((op) => {
      timeline.push({
        id: `operation-${op.id}`,
        type: "operation",
        date: op.operation_date,
        title: op.operation_name,
        description: op.notes ?? "Surgical procedure",
        details: op,
      });
    });

    // Sort by date (most recent first)
    timeline.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setEvents(timeline);
  }, [inpatientRecords, outpatientVisits, operations]);

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.type === filter);

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "inpatient":
        return <Hospital className="text-yellow-600" size={20} />;
      case "outpatient":
        return <Stethoscope className="text-blue-600" size={20} />;
      case "operation":
        return <Scissors className="text-red-600" size={20} />;
    }
  };

  const getEventColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "inpatient":
        return "border-yellow-400 bg-yellow-50";
      case "outpatient":
        return "border-blue-400 bg-blue-50";
      case "operation":
        return "border-red-400 bg-red-50";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setFilter("all");
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({events.length})
        </button>
        <button
          onClick={() => {
            setFilter("inpatient");
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "inpatient"
              ? "bg-yellow-600 text-white"
              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          }`}
        >
          Inpatient ({inpatientRecords.length})
        </button>
        <button
          onClick={() => {
            setFilter("outpatient");
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "outpatient"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
          }`}
        >
          Outpatient ({outpatientVisits.length})
        </button>
        <button
          onClick={() => {
            setFilter("operation");
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "operation"
              ? "bg-red-600 text-white"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          Operations ({operations.length})
        </button>
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500">No records found</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300" />

          {/* Events */}
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="relative pl-14">
                {/* Icon */}
                <div className="absolute left-3 top-2 w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                  {getEventIcon(event.type)}
                </div>

                {/* Event Card */}
                <div
                  className={`border-l-4 rounded-lg p-4 ${getEventColor(event.type)} cursor-pointer transition-all hover:shadow-md`}
                  onClick={() => {
                    setExpandedId(expandedId === event.id ? null : event.id);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        {event.status && (
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              event.status === "Currently Admitted"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-green-200 text-green-800"
                            }`}
                          >
                            {event.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {event.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(event.date, event.time)}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {expandedId === event.id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === event.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
                      {event.type === "inpatient" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="font-medium">Ward:</span>{" "}
                            {(event.details as InpatientRecord).ward}
                          </div>
                          <div>
                            <span className="font-medium">Unit Number:</span>{" "}
                            {(event.details as InpatientRecord).unit_number}
                          </div>
                          <div>
                            <span className="font-medium">Admission Date:</span>{" "}
                            {formatDate(
                              (event.details as InpatientRecord)
                                .date_of_admission
                            )}
                          </div>
                          {(event.details as InpatientRecord)
                            .date_of_discharge && (
                            <div>
                              <span className="font-medium">
                                Discharge Date:
                              </span>{" "}
                              {formatDate(
                                (event.details as InpatientRecord)
                                  .date_of_discharge ?? "0"
                              )}
                            </div>
                          )}
                          <div className="col-span-2">
                            <span className="font-medium">
                              Provisional Diagnosis:
                            </span>{" "}
                            {(event.details as InpatientRecord).prov_diagnosis}
                          </div>
                          {(event.details as InpatientRecord)
                            .final_diagnosis && (
                            <div className="col-span-2">
                              <span className="font-medium">
                                Final Diagnosis:
                              </span>{" "}
                              {
                                (event.details as InpatientRecord)
                                  .final_diagnosis
                              }
                            </div>
                          )}
                        </div>
                      )}

                      {event.type === "outpatient" && (
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">History:</span>{" "}
                            {(event.details as OutpatientVisit).history}
                          </div>
                          <div>
                            <span className="font-medium">Diagnosis:</span>{" "}
                            {(event.details as OutpatientVisit).diagnosis}
                          </div>
                          <div>
                            <span className="font-medium">Treatment:</span>{" "}
                            {(event.details as OutpatientVisit).treatment}
                          </div>
                          {(event.details as OutpatientVisit).notes && (
                            <div>
                              <span className="font-medium">Notes:</span>{" "}
                              {(event.details as OutpatientVisit).notes}
                            </div>
                          )}
                        </div>
                      )}

                      {event.type === "operation" && (
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Operation:</span>{" "}
                            {(event.details as Operation).operation_name}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{" "}
                            {formatDate(
                              (event.details as Operation).operation_date
                            )}
                          </div>
                          {(event.details as Operation).notes && (
                            <div>
                              <span className="font-medium">Notes:</span>{" "}
                              {(event.details as Operation).notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientTimeline;
