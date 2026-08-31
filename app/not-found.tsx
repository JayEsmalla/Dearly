import Link from "next/link";
import { HeartMark } from "@/app/ui/brand";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <span className="not-found-brand"><HeartMark /></span>
      <span className="not-found-code">404</span>
      <h1>This little gift could not be found.</h1>
      <p>The link may be incomplete, expired, or no longer available.</p>
      <Link className="button button--primary" href="/">Return to Dearly</Link>
    </main>
  );
}
