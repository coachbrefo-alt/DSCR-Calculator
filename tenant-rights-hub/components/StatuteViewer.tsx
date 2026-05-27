"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Statute {
  id: string;
  section_number: string;
  section_title: string;
  full_text: string;
  source_url: string;
  chapter: string;
  state: string;
}

interface Props {
  statute: Statute;
  stateSlug: string;
}

export default function StatuteViewer({ statute, stateSlug }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 text-left transition-colors"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            § {statute.section_number}
          </span>
          <h3 className="font-semibold text-gray-800 mt-0.5 truncate">{statute.section_title}</h3>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
        )}
      </button>

      {open && (
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {statute.full_text}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Link
              href={`/${stateSlug}/${encodeURIComponent(statute.section_number)}`}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Permalink →
            </Link>
            {statute.source_url && (
              <a
                href={statute.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                Source <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
