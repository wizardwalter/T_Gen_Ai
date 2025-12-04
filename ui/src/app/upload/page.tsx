"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

type UploadResult = {
  files: { name: string; size: number; mimetype: string }[];
  summary: string;
  graph: { nodes: any[]; edges: any[] };
};

export default function UploadPage() {
  const { data: session } = useSession();
  const [folderName, setFolderName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (files: File[]) => {
    setError(null);
    setResult(null);
    if (!files.length) {
      setError("No files selected.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      files.forEach((file) => form.append("files", file));
      const resp = await fetch(`${API_BASE}/api/terraform/upload`, {
        method: "POST",
        body: form,
      });
      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || `Upload failed with status ${resp.status}`);
      }
      const json = (await resp.json()) as UploadResult;
      setResult(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pb-16 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Upload Terraform
            </p>
            <h1 className="text-3xl font-semibold text-slate-50">
              Drop your modules to render a diagram
            </h1>
            <p className="text-sm text-slate-400">
              We read your HCL and generate a clean architecture view.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 hover:border-slate-500"
          >
            ← Back
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur">
          {session ? (
            <>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-slate-200">
                  Signed in as{" "}
                  <span className="font-semibold">
                    {session.user?.email || session.user?.name}
                  </span>
                </p>
                <label
                  htmlFor="folder-input"
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 px-6 py-10 text-center transition hover:border-slate-500"
                >
                  <div className="rounded-full bg-sky-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-sky-200">
                    Upload folder
                  </div>
                  <p className="text-lg font-semibold text-slate-50">
                    Drop a Terraform folder or click to browse
                  </p>
                  <p className="max-w-md text-sm text-slate-400">
                    We’ll read HCL, detect resources, and send a parsed graph to the backend.
                  </p>
                  <input
                    id="folder-input"
                    type="file"
                    multiple
                    // webkitdirectory enables folder selection in Chromium-based browsers
                    //@ts-expect-error webkitdirectory is not in the TS defs
                    webkitdirectory="true"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const first = files[0] as any;
                      if (first && first.webkitRelativePath) {
                        const name = first.webkitRelativePath.split("/")[0];
                        setFolderName(name);
                      } else {
                        setFolderName(files[0]?.name ?? null);
                      }
                      if (files.length) {
                        void handleUpload(files);
                      }
                    }}
                  />
                  {folderName && (
                    <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-100">
                      Selected: {folderName}
                    </div>
                  )}
                </label>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    What we parse
                  </p>
                  <p className="mt-1">Modules, providers, resources, outputs.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Destination
                  </p>
                  <p className="mt-1">Backend API for diagram synthesis.</p>
                </div>
              </div>
              {uploading && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
                  Uploading and parsing… (this may take a few seconds)
                </div>
              )}
              {error && (
                <div className="mt-4 rounded-xl border border-rose-500/50 bg-rose-500/10 p-4 text-sm text-rose-100">
                  {error}
                </div>
              )}
              {result && (
                <div className="mt-4 space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Parse summary
                  </p>
                  <p>{result.summary}</p>
                  <p>
                    Nodes: {result.graph.nodes.length} · Edges: {result.graph.edges.length}
                  </p>
                  <div className="text-xs text-slate-400">
                    Files: {result.files.map((f) => f.name).join(", ")}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-lg font-semibold text-slate-50">
                Sign in to start uploading Terraform.
              </p>
              <p className="max-w-md text-sm text-slate-400">
                Use Google SSO to keep things simple—no passwords, no extra steps.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/auth/sign-in"
                  className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-sm font-semibold text-slate-50 shadow-[0_15px_40px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
                >
                  Sign in
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 hover:border-slate-500"
                >
                  Back home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
