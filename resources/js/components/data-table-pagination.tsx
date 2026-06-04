import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';

type DataTablePaginationProps<T> = {
    paginator: Paginated<T>;
    className?: string;
};

function pageLabel(label: string): string {
    if (label.includes('Previous')) {
        return 'Previous';
    }

    if (label.includes('Next')) {
        return 'Next';
    }

    return label.replace(/&laquo;|&raquo;/g, '').trim();
}

export function DataTablePagination<T>({
    paginator,
    className,
}: DataTablePaginationProps<T>) {
    const lastPage = paginator.meta?.last_page ?? paginator.last_page ?? 1;

    if (lastPage <= 1) {
        return null;
    }

    const total = paginatorTotal(paginator);
    const from = paginator.meta?.from ?? paginator.from;
    const to = paginator.meta?.to ?? paginator.to;
    const currentPage =
        paginator.meta?.current_page ?? paginator.current_page ?? 1;
    const links = paginator.links ?? [];

    const previous = links.find((link) => link.label.includes('Previous'));
    const next = links.find((link) => link.label.includes('Next'));
    const numberedLinks = links.filter(
        (link) =>
            !link.label.includes('Previous') && !link.label.includes('Next'),
    );

    return (
        <div
            className={`flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className ?? ''}`}
        >
            <p className="text-sm text-muted-foreground">
                {from !== null && to !== null
                    ? `Showing ${from}–${to} of ${total}`
                    : `${total} ${total === 1 ? 'row' : 'rows'}`}
            </p>
            <div className="flex flex-wrap items-center gap-1">
                {previous?.url ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={previous.url} preserveScroll preserveState>
                            <ChevronLeft className="size-4" />
                            {pageLabel(previous.label)}
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        <ChevronLeft className="size-4" />
                        Previous
                    </Button>
                )}
                {numberedLinks.map((link) =>
                    link.url ? (
                        <Button
                            key={`${link.label}-${link.url}`}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            asChild
                        >
                            <Link
                                href={link.url}
                                preserveScroll
                                preserveState
                            >
                                {pageLabel(link.label)}
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            key={link.label}
                            variant="outline"
                            size="sm"
                            disabled
                        >
                            {pageLabel(link.label)}
                        </Button>
                    ),
                )}
                {next?.url ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={next.url} preserveScroll preserveState>
                            {pageLabel(next.label)}
                            <ChevronRight className="size-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Next
                        <ChevronRight className="size-4" />
                    </Button>
                )}
            </div>
            <p className="text-xs text-muted-foreground sm:text-right">
                Page {currentPage} of {lastPage}
            </p>
        </div>
    );
}
