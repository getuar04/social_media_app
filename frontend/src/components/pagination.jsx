export default function Pagination({ page, totalPages, onPage }) {
  if (!totalPages || totalPages <= 1) return null;

  const build = () => {
    const pages = [];
    const add = (x) => pages.push(x);

    add(1);

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) add("...");

    for (let p = start; p <= end; p++) add(p);

    if (end < totalPages - 1) add("...");

    if (totalPages > 1) add(totalPages);

    return pages;
  };

  const items = build();

  return (
    <nav className="d-flex justify-content-center mt-4">
      <ul className="pagination mb-0">
        {items.map((it, idx) =>
          it === "..." ? (
            <li key={`dots-${idx}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li key={it} className={`page-item ${it === page ? "active" : ""}`}>
              <button className="page-link" onClick={() => onPage(it)}>
                {it}
              </button>
            </li>
          ),
        )}

        <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages}
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
}
