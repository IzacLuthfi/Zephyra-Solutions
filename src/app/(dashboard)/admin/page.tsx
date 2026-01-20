export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-red-600">Admin Dashboard</h1>
      <p>Hanya user dengan role 'admin' yang bisa melihat ini.</p>
    </div>
  );
}