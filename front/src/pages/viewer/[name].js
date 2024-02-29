import styles from "@/styles/Home.module.css";
import DataAnalyticsReport from "../../../components/DataAnalyticsReport";
import { DropdownList } from "react-widgets";
import { useRouter } from "next/router";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

import "react-widgets/styles.css";

export default function Home({ fileNames, doc }) {
  const router = useRouter();

  return (
    <div className={styles.viewerContainer}>
      <Navbar />
      <div className={styles.dropdownContainer}>
        <p>Select a file</p>
        <DropdownList
          data={fileNames}
          textField="name"
          placeholder="HPLT.en-es"
          onChange={(value) => {
            router.push(
              {
                pathname: `/viewer/${value}`,
              },
              undefined
            );
          }}
        />
      </div>
      <div className={styles.docContainer}>
        {doc && <DataAnalyticsReport reportData={doc} />}
      </div>
      <Footer />
    </div>
  );
}

export async function getServerSideProps(context) {
  const yaml = require("js-yaml");
  const axios = require("axios");

  const apiList = await axios.get("http://dat-webapp:8000/list");

  const list = apiList.data;
  if (list.length) {
    list.pop();
  }

  const listNames = list.length ? list.map((a) => a.replace(".yaml", "")) : "";

  let doc = "";

  if (context.query.name != "name") {
    const stats = await axios.get(
      `http://dat-webapp:8000/file/${context.query.name}.yaml`
    );

    const statsData = stats.data;

    doc = yaml.load(statsData);
  }

  return {
    props: { fileNames: listNames, doc: doc },
  };
}
