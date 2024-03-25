import DataAnalyticsReport from "../../../components/DataAnalyticsReport";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { DropdownList } from "react-widgets";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Oval } from "react-loader-spinner";

import styles from "@/styles/Home.module.css";

import "react-widgets/styles.css";

export default function Home({ fileNames }) {
  const [report, setReport] = useState("");
  const [date, setDate] = useState("");

  const [status, setStatus] = useState("IDLE");

  const router = useRouter();

  async function getStats() {
    setStatus("LOADING");
    try {
      const stats = await axios.get(`/api/getstats/${router.query.file}`);

      const statsData = stats.data;

      setStatus("IDLE");

      setReport(statsData.stats);
      setDate(statsData.date);
    } catch (error) {
      setStatus("FAILED");
      console.log(error);
    }
  }

  useEffect(() => {
    const file = router.query.file;

    if (file !== "file") {
      getStats();
    }
  }, [router.query]);

  return (
    <div className={styles.viewerContainer}>
      <Navbar />
      <div className={styles.dropdownContainer}>
        <p>Select a file</p>
        <div className={styles.flex}>
          <DropdownList
            data={fileNames}
            placeholder="CCMatrix"
            onChange={(e) => router.push(`/viewer/${e}`)}
          />
        </div>
      </div>
      <div className={styles.docContainer}>
        {status === "LOADING" && (
          <div className={styles.loader}>
            <h1>Loading stats...</h1>
            <Oval
              visible={true}
              height="100"
              width="100"
              color="#4fa94d"
              ariaLabel="oval-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        )}
        {status === "FAILED" && (
          <div>
            Something went wrong with the requested file, please try again.
          </div>
        )}
        {report && status !== "LOADING" && (
          <DataAnalyticsReport reportData={report} date={date} />
        )}
      </div>
      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  const axios = require("axios");

  const apiList = await axios.get("http://dat-webapp:8000/list");

  const list = apiList.data;

  return {
    props: { fileNames: list },
  };
}
