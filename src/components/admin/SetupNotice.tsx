export function SetupNotice() {
  return (
    <div className="shell py-24">
      <p className="eyebrow mb-4">Admin</p>
      <h1 className="page-title mb-8">Connect Supabase</h1>
      <div className="max-w-xl space-y-4 leading-[1.8] text-ink/80">
        <p>
          The site is running on its built-in demo works because no database is connected yet. To manage artwork here,
          add these environment variables and restart:
        </p>
        <pre className="overflow-x-auto bg-mat p-5 text-[13px]">
          {`NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY`}
        </pre>
        <p>The README walks through creating the Supabase project, running supabase/schema.sql and adding your login.</p>
      </div>
    </div>
  );
}
