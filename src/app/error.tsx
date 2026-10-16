'use client';
export default function ErrorPage({reset}:{reset:()=>void}) { return <section role="alert"><h1>Unable to load this view</h1><p>Check local storage permissions and configuration, then retry. Existing data has not been reset. Do not delete the database to recover from an error.</p><button onClick={reset}>Try again</button></section>; }
