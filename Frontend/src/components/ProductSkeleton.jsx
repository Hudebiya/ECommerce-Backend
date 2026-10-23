export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-sage/30 animate-pulse">
      <div className="aspect-square bg-sage/20" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-sage/30 rounded w-3/4" />
        <div className="h-3 bg-sage/20 rounded w-1/4" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-sage/30 rounded w-1/4" />
          <div className="h-10 w-10 bg-sage/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}