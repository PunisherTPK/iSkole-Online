type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <span
          key={page}
          className={`grid h-10 w-10 place-items-center rounded-lg text-sm font-semibold ${
            page === currentPage ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700"
          }`}
        >
          {page}
        </span>
      ))}
    </nav>
  );
}
