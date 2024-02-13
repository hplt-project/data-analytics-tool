import Image from "next/image";
import AnalyticsLogo from "../public/logos/HPLTAnalytics-light.svg";
import styles from "@/styles/Navbar.module.css";
import Link from "next/link";
export default function Navbar() {
  return (
    <div className={styles.navbar}>
      <Image
        src={AnalyticsLogo}
        width={240}
        height={50}
        className={styles.logo}
      />
      <div className={styles.navLinks}>
        <Link
          href="http://localhost:8000/uploader.html"
          className={styles.singleNavLink}
        >
          Uploader
        </Link>
        <Link href="http://localhost:3000/" className={styles.singleNavLink}>
          Viewer
        </Link>{" "}
      </div>
    </div>
  );
}
