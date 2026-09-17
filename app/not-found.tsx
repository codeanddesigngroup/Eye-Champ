import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <p className={styles.code}>404</p>
      <h1>PAGE NOT FOUND</h1>
      <p>The page you’re looking for may have moved or no longer exists.</p>
      <div className={styles.actions}>
        <Link href="/">BACK TO HOME</Link>
        <Link href="/shop-all">SHOP ALL EYEWEAR</Link>
      </div>
    </main>
  );
}
