import React from "react";
import { Pencil, Trash2, RefreshCcw, Check, X } from "lucide-react";

export default function TaskTable({
  tasks,
  role,          // current user's role (lowercase)
  department,    // current user's department (lowercase)
  onUpdateStatus,
  onApprove,
  onReject,
  onDelete,
  onEdit,
  onReassign,
}) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Assigned To</th>
            <th className="p-2 border">Due Date</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task.task_id} className="hover:bg-gray-50">
                <td className="p-2 border">{task.title}</td>
                <td className="p-2 border">{task.description}</td>
                <td className="p-2 border">
                  {task.assigned_staff && task.assigned_staff.length > 0
                    ? task.assigned_staff.map((s) => s.full_name).join(", ")
                    : "—"}
                </td>
                <td className="p-2 border">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}
                </td>
                <td className="p-2 border">{task.status}</td>

                <td className="p-2 border">
                  <div className="flex gap-2 items-center">
                    {/* Staff can update their task status */}
                    {onUpdateStatus && (
                      <select
                        value={task.status}
                        onChange={(e) => onUpdateStatus(task.task_id, e.target.value)}
                        className="border p-1 rounded"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Ready for QA">Ready for QA</option>
                      </select>
                    )}

                    {/* QA Approve/Reject */}
                    {onApprove && onReject && (
                      <>
                        <button
                          title="Approve Task"
                          onClick={() => onApprove(task.task_id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          title="Reject Task"
                          onClick={() => onReject(task.task_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}

                    {/* Admin actions */}
                    {onEdit && (
                      <button
                        title="Edit Task"
                        onClick={() => onEdit(task)}
                        className="text-sky-600 hover:text-sky-800"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                    {onReassign && (
                      <button
                        title="Reassign Task"
                        onClick={() => onReassign(task)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <RefreshCcw size={18} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        title="Delete Task"
                        onClick={() => onDelete(task.task_id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">
                No tasks found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}