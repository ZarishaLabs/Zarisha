'use client';

import React from 'react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  buildPageUrl?: (page: number) => string;
  className?: string;
}

export default function Pagination({
  currentPage,
  lastPage,
  onPageChange,
  buildPageUrl,
  className = '',
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;
    pages.push(1);
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(lastPage - 1, currentPage + delta);
    if (rangeStart > 2) pages.push('...');
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < lastPage - 1) pages.push('...');
    if (lastPage > 1) pages.push(lastPage);
    return pages;
  };

  if (lastPage <= 1) return null;

  const btnClass = 'button-secondary px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 active:bg-white/10 transition-colors';
  const pageBtnClass = (active: boolean) =>
    `min-w-[40px] px-2 py-2 rounded-card font-semibold transition-colors ${
      active ? 'bg-surface border border-accent text-accent' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
    }`;

  return (
    <div className={`flex justify-center ${className}`}>
      <nav className="flex items-center gap-2">
        {buildPageUrl ? (
          <>
            {currentPage > 1 ? (
              <Link href={buildPageUrl(currentPage - 1)} className={btnClass} aria-label="Previous page">
                Previous
              </Link>
            ) : (
              <span className={btnClass + ' opacity-30 cursor-not-allowed'} aria-hidden>Previous</span>
            )}
            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-text-secondary select-none">...</span>
                  );
                }
                const pageNum = page as number;
                return (
                  <Link
                    key={pageNum}
                    href={buildPageUrl(pageNum)}
                    className={pageBtnClass(pageNum === currentPage)}
                    aria-current={pageNum === currentPage ? 'page' : undefined}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>
            <div className="sm:hidden flex items-center px-2 text-sm text-body-secondary font-mono">
              {currentPage} / {lastPage}
            </div>
            {currentPage < lastPage ? (
              <Link href={buildPageUrl(currentPage + 1)} className={btnClass} aria-label="Next page">
                Next
              </Link>
            ) : (
              <span className={btnClass + ' opacity-30 cursor-not-allowed'} aria-hidden>Next</span>
            )}
          </>
        ) : (
          <>
            <button
              className={btnClass}
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              Previous
            </button>
            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-text-secondary select-none">...</span>
                  );
                }
                const pageNum = page as number;
                return (
                  <button
                    key={pageNum}
                    className={pageBtnClass(pageNum === currentPage)}
                    onClick={() => onPageChange(pageNum)}
                    aria-current={pageNum === currentPage ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <div className="sm:hidden flex items-center px-2 text-sm text-body-secondary font-mono">
              {currentPage} / {lastPage}
            </div>
            <button
              className={btnClass}
              disabled={currentPage === lastPage}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next page"
            >
              Next
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
