import styles from "@/styles/Home.module.css";
import DataAnalyticsReport from "../../../components/DataAnalyticsReport";
import { DropdownList } from "react-widgets";
import { readdir } from "fs/promises";
import { useState } from "react";
import { useRouter } from "next/router";

import "react-widgets/styles.css";
import Navbar from "../../../components/Navbar";

export default function Home({ fileNames, stats, doc }) {
  const router = useRouter();
  // Call this function whenever you want to
  // refresh props!
  const refreshData = () => {
    router.replace(router.asPath);
  };
  function redirect() {
    router.push(
      {
        pathname: `/${corpusName}/${origin}&${target}/${latestVersion}/${corpusName}`,
      },
      undefined,
      { shallow: true }
    );
  }

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
      {doc && <DataAnalyticsReport reportData={doc} />}
    </div>
  );
}

export async function getServerSideProps(context) {
  const yaml = require("js-yaml");
  const fs = require("fs");
  const path = require("path");

  let doc = "";

  console.log(context, "HELOCHISsdsfddsds");
  if (context.query.name != "name") {
    doc = yaml.load(
      fs.readFileSync(
        path.join(process.cwd(), `../yaml_dir/${context.query.name}.yaml`)
      )
    );
  }
  // const doc = yaml.load(
  //   fs.readFileSync(path.join(process.cwd(), "../yaml_dir/EN-ES.yaml"))
  // );

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
