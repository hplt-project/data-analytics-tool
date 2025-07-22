import Image from "next/image";
import Logo from "@/../../public/images/logos/logo.svg";

import styles from "@/styles/ReportTitle.module.css";

function ReportTitle() {
  return (
    <div className={styles.analyticsTitleContainer}>
      <h1 className={styles.analyticsTitle}>HPLT Analytics report</h1>
      <h2>
        <Image src={Logo} width={30} height={30} className={styles.logo} alt="hplt analytics logo" />
        <p className={styles.hpltAnalyticsTitle}>
          <span className={styles.analyticsTitleSpan}>HPLT</span>Analytics
        </p>
      </h2>
    </div>
  );
}

export default ReportTitle;
