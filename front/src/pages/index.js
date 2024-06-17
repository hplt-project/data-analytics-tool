import "react-widgets/styles.css";
import styles from "@/styles/Home.module.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { BarChart3, HardDriveUpload } from "lucide-react";
import Link from "next/link";

import "react-widgets/styles.css";

export default function Home() {
  return (
    <div className={styles.viewerContainer}>
      <Navbar />
      <div className={styles.mainContainerHome}>
        <h1>HPLT Analytics Tool</h1>
        <p className={styles.introParagraph}>
          This tool provides a full range of analytics automatically computed on
          either monolingual or bilingual data sets to help making informed
          decisions about them.
        </p>
        <div className={styles.cardsContainer}>
          <div className={styles.singleCard}>
            <BarChart3 size={88} strokeWidth={1.5} />
            <div className={styles.cardDetails}>
              <h2>View</h2>
              <p>Navigate, view and download your available reports.</p>
            </div>
            <Link className={styles.uploadBtn} href="/viewer">
              Viewer
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


/*
          <div className={styles.singleCard}>
            <HardDriveUpload size={88} strokeWidth={1.5} />
            <div className={styles.cardDetails}>
              <h2>Upload</h2>
              <p>
                Upload your corpus, get it analyzed. Reports are available at
                the Viewer as soon as they are ready.{" "}
              </p>
            </div>
            <Link className={styles.uploadBtn} href="/uploader">
              Upload
            </Link>
          </div>

*/