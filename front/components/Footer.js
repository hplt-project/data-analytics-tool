import Image from "next/image";
import EULogo from "../public/logos/eu-flag.png";
import UKRILogo from "../public/logos/UKRIlogo.png";
import XLogo from "../public/logos/logo-black.png";
import HorizonLogo from "../public/logos/horizon.svg";

import styles from "@/styles/Footer.module.css";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles["footer-text-left"]}>
        <p className={styles["hplt-copyright"]}>Ⓒ HPLT 2024</p>
        <a
          href="https://cordis.europa.eu/project/id/101070350"
          className={styles["horizon-link"]}
          target="_blank"
        >
          <Image
            src={HorizonLogo}
            alt="european-union-flag"
            width={55}
            className={styles["horizon-logo"]}
          />
        </a>

        <a
          href="https://www.ukri.org"
          className={styles["ukri-link"]}
          target="_blank"
        >
          <Image
            src={UKRILogo}
            alt="ukri-logo"
            width={136}
            className={styles["ukri-logo"]}
          />
        </a>

        <p className={styles["footer-info"]}>
          This project has received funding from the European Union’s Horizon
          Europe research and innovation programme under grant agreement No
          101070350 and from UK Research and Innovation (UKRI) under the UK
          government’s Horizon Europe funding guarantee [grant number 10052546]
        </p>
      </div>
      <div className={styles["footer-text-middle"]}>
        <Image
          src={EULogo}
          alt="eu flag"
          className={styles["eu-flag"]}
          width={50}
        />
        <p className={styles["footer-info"]}>
          The contents of this publication are the sole responsibility of the
          HPLT consortium and do not necessarily reflect the opinion of the
          European Union.
        </p>
      </div>
      <div className={styles["footer-text-right"]}>
        <a href="https://twitter.com/hplt_eu" target="_blank" rel="noreferrer">
          <Image
            src={XLogo}
            alt="x logo"
            width={25}
            className={styles["twitter-icon-footer"]}
          />
        </a>
      </div>
    </div>
  );
}
