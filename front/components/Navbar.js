import Image from "next/image";
import AnalyticsLogo from "../public/logos/HPLTAnalytics-light.svg";
import styles from "@/styles/Navbar.module.css";
import { Spiral as Hamburger } from 'hamburger-react'
import { useState } from "react";

import Link from "next/link";

export default function Navbar() {

  const [isOpen, setOpen] = useState(false);

  return (
    <div className={styles.navbar}>
      <Link href="/">
        <Image
          src={AnalyticsLogo}
          width={240}
          height={50}
          className={styles.logo}
        />
      </Link>
      <div className={styles.navLinks}>
        <Link href="/viewer" className={styles.singleNavLink}>
          Viewer
        </Link>
      </div>
      <div className={styles.hamburger}>
        <Hamburger toggled={isOpen} toggle={setOpen} />
      </div>
      <div className={isOpen ? styles.navbarDropdown : styles.hidden}>
      {/* <Link href="/uploader" className={styles.singleNavLink}>
          Uploader
        </Link> */}
        <Link href="/viewer" className={styles.singleNavLink}>
          Viewer
        </Link>
      </div>
    </div>
  );
}
