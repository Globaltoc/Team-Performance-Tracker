import React from "react";

export default function TaskTable({
  tasks,
  role,          // current user's role (lowercase)
  department,    // current user's department (lowercase)
  onUpdateStatus,
  onApprove,
  onReject,
  onDelete,
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
                  {/* Staff or dynamic role can update status */}
                  {onUpdateStatus && (
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateStatus(task.task_id, e.target.value)}
                      className="border p-1 rounded mb-1"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  )}

                  {/* Department-based approval/reject */}
                  {onApprove && onReject && (
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => onApprove(task.task_id)}
                        className="px-2 py-1 bg-green-500 text-white rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(task.task_id)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Admin or roles without actions */}
                  {!onUpdateStatus && !onApprove && !onReject && onDelete && (
                    <span className="text-gray-500">—</span>
                  )}

                  {/* Delete button for Admin */}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(task.task_id)}
                      className="ml-2 px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  )}
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