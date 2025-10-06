import Report from "@/components/Report";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Oval } from "react-loader-spinner";
import { parseYamlFile } from "@/lib/helpers";

import styles from "@/styles/Home.module.css";

import "react-widgets/styles.css";

export default function ExternalFileViewer() {
    const router = useRouter();

    const [report, setReport] = useState("");
    const [currentFile, setCurrentFile] = useState("");
    const [date, setDate] = useState("");
    const [status, setStatus] = useState("IDLE");
    const [url, setURL] = useState("");

    const file = router.isReady ? router.query.file : undefined;

    useEffect(() => {
        if (!router.isReady) return;
        if (!file || file === "file") return;

        let cancelled = false;

        (async () => {
            setStatus("LOADING");
            try {
                const { data } = await axios.get(`/api/getstats/${encodeURIComponent(file)}`);
                if (cancelled) return;
                if (!data) {
                    setStatus("FAILED");
                    return;
                }
                setReport(data.report);
                setDate(data.date);
                setStatus("IDLE");
            } catch (err) {
                if (!cancelled) setStatus("FAILED");
                console.error(err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [router.isReady, file]);


    function readSingleFile(e, hook) {
        setURL("");
        setReport("");
        setStatus("LOADING");
        var myFile = e.target.files[0];
        var reader = new FileReader();

        try {
            reader.readAsText(myFile);
            reader.onload = function () {
                const result = parseYamlFile(reader.result);

                hook(result);
                setStatus("IDLE")
            };
        } catch (error) {
            setStatus("FAILED");
        }

    }


    async function getFileFromURL(url) {
        if (!url) return;
        setCurrentFile("");
        setReport("");
        setStatus("LOADING");

        try {
            const fileResult = await axios.get(url);
            const result = parseYamlFile(fileResult.data);
            setReport(result);

            setStatus("IDLE");
        } catch (error) {
            setStatus("FAILED");
        }

        setURL("");

    }


    return (
        <div className={styles.viewerContainer}>
            <Navbar />
            <div className={styles.dropdownContainer}>
                <h1>View an external file</h1>
                <div className={styles.inputs}>
                    <div className={styles.singleInput}>
                        <p>From file</p>
                        <div className={styles.urlInput}>

                            <label for="from-file" className={styles.fileLabel}>Browse...</label>
                            <input type="file" name="from-file" accept=".yaml, .yml" className={styles.fileInput} id="from-file"
                                onChange={(e) => {
                                    setCurrentFile(e.target.files[0].name);
                                    readSingleFile(e, setReport);
                                }}
                            />
                            <p>{currentFile ? currentFile : "No file selected"}</p>
                        </div>
                    </div>
                    <div className={styles.singleInput}>
                        <label for="from-url">From URL</label>
                        <div className={styles.urlInput}>
                            <input type="text" name="from-url" onChange={(e) => setURL(e.target.value)} />
                            <button className={styles.activeGetFileBtn} disabled={!url} onClick={() => getFileFromURL(url)}>Get file</button>
                        </div>
                    </div>
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
                    <div className={styles.failedWarning}>
                        The requested file is not supported or can't be read.
                    </div>
                )}
                {status !== "LOADING" && (
                    <Report date={date} report={report} />
                )}
            </div>
            <Footer />
        </div>
    );
}