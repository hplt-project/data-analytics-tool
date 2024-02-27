import styles from "@/styles/Home.module.css";
import DataAnalyticsReport from "../../../components/DataAnalyticsReport";
import { DropdownList } from "react-widgets";
import { readdir } from "fs/promises";
import { useRouter } from "next/router";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

import "react-widgets/styles.css";

export default function Home({ fileNames, stats, doc }) {
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
  const fs = require("fs");
  const path = require("path");

  let doc = "";

  if (context.query.name != "name") {
    doc = yaml.load(
      fs.readFileSync(
        path.join(process.cwd(), `../yaml_dir/${context.query.name}.yaml`)
      )
    );
  }

  const directoryPath = path.join(process.cwd(), "../yaml_dir");
  const fileNames = [];
  let stats = "";
  try {
    const files = await readdir(directoryPath);
    files.forEach(function (file) {
      fileNames.push(file.substring(0, file.indexOf(".")));
    });
  } catch (err) {
    console.log("Unable to scan directory: " + err);
  }
  return {
    props: { fileNames: fileNames, stats: stats, doc: doc },
  };
}
