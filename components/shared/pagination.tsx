import Link from "next/link";
import { Button } from "@/components/ui/button";
import { listUrl, type ListParams } from "@/lib/list-params";
export function Pagination({
  path,
  params,
  page,
  pages,
  total,
}: {
  path: string;
  params: ListParams;
  page: number;
  pages: number;
  total: number;
}) {
  return (
    <nav
      aria-label="Pagination"
      className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <p className="text-muted-foreground">
        {total} results · Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button variant="outline" size="sm" asChild>
            <Link
              href={listUrl(path, params, { page: String(page - 1) })}
              aria-label="Previous page"
            >
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        )}
        {page < pages ? (
          <Button variant="outline" size="sm" asChild>
            <Link
              href={listUrl(path, params, { page: String(page + 1) })}
              aria-label="Next page"
            >
              Next
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </nav>
  );
}
