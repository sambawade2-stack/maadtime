export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-muted rounded-2xl" />
        <div className="h-72 bg-muted rounded-2xl" />
      </div>
    </div>
  );
}
