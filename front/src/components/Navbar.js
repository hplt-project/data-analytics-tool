import Image from "next/image";
import Logo from "@/../../public/images/logos/HPLTAnalytics-light.svg";

import styles from "@/styles/Navbar.module.css";
import { Spiral as Hamburger } from "hamburger-react";
import { useState } from "react";

import Link from "next/link";

export default function Navbar() {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className={styles.navbar}>
      <Link href="/">
        <Image src={Logo} width={240} height={45} className={styles.logo} alt="hplt analytics logo" />
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
        <Link href="/viewer" className={styles.singleNavLink}>
          Viewer
        </Link>
      </div>
    </div>
  );
}
