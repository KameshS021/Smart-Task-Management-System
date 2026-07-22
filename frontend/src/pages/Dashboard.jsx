import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/api/tasks/all");
      console.log(res.data);
      setTasks(res.data.tasks);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Dashboard</h1>

      <button
        onClick={() => navigate("/create")}
        style={{
          padding: "10px 20px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        + Create Task
      </button>

      <h2>My Tasks</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Title</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.assignedTo}</td>
              <td>{task.status}</td>
              <td>{task.priority}</td>
              <td>{task.dueDate?.substring(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



