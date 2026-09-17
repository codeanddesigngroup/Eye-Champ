import Link from "next/link";
import "./store-paused.css";

export default function StorePausedPage() {
  return <main className="store-paused-page">
    <section>
      <h1>Store is temporarily paused</h1>
      <p>Eye Champ is not available for shopping right now. Please check back soon.</p>
      <Link href="/admin/login">Admin login</Link>
    </section>
  </main>;
}
