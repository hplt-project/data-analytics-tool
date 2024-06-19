import DataAnalyticsReport from "../../components/DataAnalyticsReport";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useRouter } from "next/router";
import { DropdownList } from "react-widgets";

import "react-widgets/styles.css";

import styles from "@/styles/Home.module.css";


export default function Home({ fileNames }) {
  const [selected, setSelected] = useState("");
  const [report, setReport] = useState("");
  const [date, setDate] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (selected) {
      router.push(`/viewer/${selected}`);
    }
  }, [selected]);

  return (
    <div className={styles.viewerContainer}>
      <Navbar />
      <div className={styles.dropdownContainer}>
        <p>Select a file</p>
        <div className={styles.flex}>
          <DropdownList
            data={fileNames}
            onChange={(e) => setSelected(e)}
            placeholder="CCMatrix"
            filter='contains'
          />
        </div>
      </div>
      <div className={styles.docContainer}>
        {report && <DataAnalyticsReport reportData={report} date={date} />}
      </div>
      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  const axios = require("axios");

  const apiList = await axios.get("http://dat-webapp:8000/list");

  const list = await apiList.data;

  return {
    props: { fileNames: list },
  };
}
