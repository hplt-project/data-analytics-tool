import { useState } from "react";
import axios from "axios";
import Footer from "@/components/Footer";
import { CheckSquare2, Copy, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { languagePairName } from "@/lib/helpers";
import CopyToClipboard from "react-copy-to-clipboard";
import { DropdownList } from "react-widgets/cjs";
import { ColorRing } from "react-loader-spinner";
import { useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

import styles from "@/styles/Uploader.module.css";
import "react-widgets/styles.css";

export default function Uploader({ languageList }) {
    const [upload, setUpload] = useState(false);
    const [fileExtension, setFileExtension] = useState("");
    const [corpusName, setCorpusName] = useState("");
    const [corpus, setCorpus] = useState("");
    const [languageMode, setLanguageMode] = useState("parallel");
    const [corpusFormat, setCorpusFormat] = useState("tsv");
    const [origin, setOrigin] = useState("");
    const [target, setTarget] = useState("");

    const [cmd, setCmd] = useState("");

    const [failedCMD, setFailedCMD] = useState("");
    const [failedUpload, setFailedUpload] = useState("");

    const [uploadStatus, setUploadStatus] = useState("");

    const [missingFile, setMissingFile] = useState(false);
    const [missingLanguage, setMissingLanguage] = useState(false);


    const inputFile = useRef(null);

    const clearFields = () => {
        setCorpusName("");
        setCorpus("");
        setOrigin("");
        setTarget("");
        if (inputFile.current) {
            inputFile.current.value = "";
            inputFile.current.type = "text";
            inputFile.current.type = "file";
        }
    }

    const toastMessage = (alert) => {
        setTimeout(() => {
            if (alert === "upload") {
                setUpload(false);
            }
            if (alert === "file") {
                setMissingFile(false);
            }
            if (alert === "cmd") {
                setFailedCMD(false);
            }
            if (alert === "language") {
                setMissingLanguage(false);
            }
            if (alert === "failed-upload") {
                setFailedUpload(false);
            }
        }, 3000);
    };

    function setFormData() {
        const formdata = new FormData();

        formdata.set("corpusname", corpusName);
        formdata.set("corpus", corpus);
        formdata.set("corpus-format", corpusFormat);
        formdata.set("lang-format", languageMode);
        formdata.set("srclang", origin);
        formdata.set("file-extension", fileExtension);
        if (!target) {
            formdata.set("trglang", "-");
        }
        if (target) {
            formdata.set("trglang", target);
        }

        return formdata;

    }

    async function uploadCorpus() {

        setUploadStatus("UPLOADING");
        const formdata = setFormData();
        if (!origin) {
            setMissingLanguage(true);
            toastMessage("language");
            return;
        }
        if (!corpus) {
            setMissingFile(true);
            toastMessage("file");
            return;
        }
        let config = {
            method: "POST",
            url: "/api/new-uploader",
            data: formdata,
            headers: { "Content-Type": "multipart/form-data" },
        };

        try {
            const res = await axios(config);
            if (res.status === 200) {
                setUploadStatus("");
                setUpload(true);
                toastMessage("upload");
                clearFields();
            }
        } catch (err) {
            setFailedUpload(true);
            toastMessage("failed-upload");
            setUploadStatus("");
            clearFields();
            console.error(err, "Request failed ");
        }

    }
    async function getCmd() {

        const formdata = setFormData();

        if (languageMode === "mono" && !origin) {
            setMissingLanguage(true);
            toastMessage("language");
            return;
        }
        if (languageMode === "parallel" && !target) {
            setMissingLanguage(true);
            toastMessage("language");
            return;
        }

        let config = {
            method: "POST",
            url: "/api/getcmd/cmd",
            data: formdata,
            headers: { "Content-Type": "multipart/form-data" },
        };

        try {
            const res = await axios(config);
            if (res.status === 200) {
                setCmd(res.data);
                clearFields();
            }
        } catch (err) {
            setFailedCMD(true);
            toastMessage("cmd");
            clearFields();
            console.error(err, "Request failed ");
        }

    }
    const [langList, setLangList] = useState(languageList);

    function handleCreate(name, setter) {
        let newOption = { value: name, label: name }
        setter(newOption.value);
        setLangList +
            (data => [newOption, ...data])
    }


    return (
        <div className={styles["main-container"]}>
            {missingFile && (
                <div className={styles.toaster}>
                    Please select a file to upload.{" "}
                    <XCircle strokeWidth={1.5} width={26} className={styles.xCircle} />
                </div>
            )}
            {failedCMD && (
                <div className={styles.toaster}>
                    Something went wrong getting CMD{" "}
                    <XCircle strokeWidth={1.5} width={26} className={styles.xCircle} />
                </div>
            )}
            {missingLanguage && (
                <div className={styles.toaster}>
                    Please select a language
                    <XCircle strokeWidth={1.5} width={26} className={styles.xCircle} />
                </div>
            )}
            <Navbar />
            {upload && (
                <div className={styles.uploadToast}>
                    <h2>
                        Your dataset was successfully uploaded!
                        <CheckSquare2
                            className={styles.partyIcon}
                            size={24}
                            strokeWidth={1.5}
                        />
                    </h2>
                    <p>Have some patience. Processing might take some time.</p>
                </div>
            )}

            {failedUpload && (
                <div className={styles.toaster}>
                    Your dataset failed to upload!
                    <XCircle strokeWidth={1.5} width={26} className={styles.xCircle} />
                </div>
            )}
            {cmd && (
                <div className={styles.loaderContainer}>
                    <div className={styles.cmd}>
                        <button className={styles.closeCmd} onClick={() => setCmd("")}>
                            Close <XCircle strokeWidth={1.5} className={styles.closeIcon} />
                        </button>
                        <div className={styles.cmdContainer}>
                            <p>{cmd}</p>
                        </div>
                        <CopyToClipboard text={cmd}>
                            <button onClick={() => toast.success("CMD Copied to clipboard!")}>
                                Copy CMD
                                <Copy className={styles.copyIcon} strokeWidth={1.3} />
                            </button>
                        </CopyToClipboard>
                        <Toaster />
                    </div>
                </div>
            )}

            {uploadStatus === "UPLOADING" && (
                <div className={styles.loaderContainer}>
                    <div className={styles.loader}>
                        <h1>Your dataset is being uploaded...</h1>
                        <ColorRing
                            visible={true}
                            height="100"
                            width="100"
                            color="#4fa94d"
                            ariaLabel="oval-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                    </div>
                </div>
            )}
            <form id="upload-form" encType="multipart/form-data">
                <div className={styles["form-group"]}>
                    <div className={styles["input-group"]}>
                        <div className={styles["name-cont"]}>
                            <label className={styles["form-label"]} htmlFor="corpusname">
                                Name
                            </label>
                            <input
                                className={styles["form-control"]}
                                id="corpusname"
                                type="text"
                                name="corpusname"
                                placeholder="Dataset name"
                                required
                                value={corpusName}
                                onChange={(e) => setCorpusName(e.target.value)}
                            ></input>
                        </div>
                        <div className={styles["file-cont"]}>
                            <label className={styles["form-label"]} htmlFor="file">
                                File
                            </label>
                            <input
                                className={[styles["form-control"], styles["file-input"]].join(
                                    " "
                                )}
                                id="corpus"
                                name="corpus"
                                type="file"
                                multiple
                                ref={inputFile}
                                onChange={(event) => {
                                    const files = event.target.files
                                    if (files && files.length > 0) {
                                        setCorpus(files[0])
                                        setFileExtension(files[0].name);
                                    }
                                }
                                }
                            />
                        </div>
                    </div>
                    <div className={styles["inputs"]}>
                        <div className={styles["form-check-inline"]}>
                            <label className={styles["form-label"]} htmlFor="lang-format-mono">
                                Language
                            </label>
                        </div>
                        <div className={styles["input-cont"]}>
                            <input
                                className={styles["form-check-input"]}
                                type="radio"
                                name="lang-format-mono"
                                id="lang-format-mono"
                                value="mono"
                                checked={languageMode === "mono"}
                                onClick={(e) => {
                                    if (e.target.checked) {
                                        setLanguageMode("mono")
                                    }
                                }}
                            />
                            <label
                                className={styles["form-check-label"]}
                                htmlFor="lang-format-mono"
                            >
                                Mono
                            </label>
                        </div>
                        <div
                            className={[
                                styles["form-check"],
                                styles["form-check-inline"],
                            ].join(" ")}
                        >
                            <input
                                className={styles["form-check-input"]}
                                type="radio"
                                name="lang-format-parallel"
                                id="lang-format-parallel"
                                value="parallel"
                                onClick={(e) => {
                                    if (e.target.checked) {
                                        setLanguageMode("parallel")
                                        setCorpusFormat("tsv")
                                    }
                                }}
                                checked={languageMode === "parallel"}
                            />

                            <label
                                className={styles["form-check-label"]}
                                htmlFor="lang-format-parallel"
                            >
                                Parallel
                            </label>
                        </div>
                    </div>
                    <div className={styles["inputs"]}>
                        <div className={styles["form-check-inline"]}>
                            <label className={styles["form-label"]} htmlFor="corpus-format">
                                Corpus format
                            </label>
                        </div>
                        <div className={styles["input-cont"]}>
                            <input
                                className={styles["form-check-input"]}
                                type="radio"
                                name="corpus-format"
                                id="corpus-format-tsv"
                                value="tsv"
                                checked={corpusFormat === "tsv"}
                                onClick={(e) => {
                                    if (e.target.checked) {
                                        setCorpusFormat("tsv")
                                    }
                                }}
                            />
                            <label
                                className={styles["form-check-label"]}
                                htmlFor="corpus-format-tsv"
                            >
                                TSV
                            </label>
                        </div>
                        <div
                            className={[
                                styles["form-check"],
                                styles["form-check-inline"],
                            ].join(" ")}
                        >
                            <input
                                className={styles["form-check-input"]}
                                type="radio"
                                name="corpus-format"
                                id="corpus-format-tmx"
                                value="tmx"
                                onClick={(e) => {
                                    if (e.target.checked) {
                                        setCorpusFormat("tmx")
                                    }
                                }}
                            />
                            <label
                                className={styles["form-check-label"]}
                                htmlFor="corpus-format-tmx"
                            >
                                TMX
                            </label>
                        </div>
                        {languageMode === "mono" && <><div
                            className={[
                                styles["form-check"],
                                styles["form-check-inline"],
                            ].join(" ")}
                        >
                            <input
                                className={styles["form-check-input"]}
                                type="radio"
                                name="corpus-format"
                                id="corpus-format-hplt"
                                value="hplt"
                                onClick={(e) => {
                                    if (e.target.checked) {
                                        setCorpusFormat("hplt")
                                    }
                                }}
                            />
                            <label
                                className={styles["form-check-label"]}
                                htmlFor="corpus-format-hplt"
                            >
                                HPLT
                            </label>
                        </div>
                            <div
                                className={[
                                    styles["form-check"],
                                    styles["form-check-inline"],
                                ].join(" ")}
                            >
                                <input
                                    className={styles["form-check-input"]}
                                    type="radio"
                                    name="corpus-format"
                                    id="corpus-format-fineweb"
                                    value="fineweb"
                                    onClick={(e) => {
                                        if (e.target.checked) {
                                            setCorpusFormat("fineweb")
                                        }
                                    }}
                                />
                                <label
                                    className={styles["form-check-label"]}
                                    htmlFor="corpus-format-fineweb"
                                >
                                    Fineweb
                                </label>
                            </div>
                            <div
                                className={[
                                    styles["form-check"],
                                    styles["form-check-inline"],
                                ].join(" ")}
                            >
                                <input
                                    className={styles["form-check-input"]}
                                    type="radio"
                                    name="corpus-format"
                                    id="corpus-format-nemotron"
                                    value="nemotron"
                                    onClick={(e) => {
                                        if (e.target.checked) {
                                            setCorpusFormat("nemotron")
                                        }
                                    }}
                                />
                                <label
                                    className={styles["form-check-label"]}
                                    htmlFor="corpus-format-nemotron"
                                >
                                    Nemotron
                                </label>
                                </div>
                            <div
                                className={[
                                    styles["form-check"],
                                    styles["form-check-inline"],
                                ].join(" ")}
                            >
                                <input
                                    className={styles["form-check-input"]}
                                    type="radio"
                                    name="corpus-format"
                                    id="corpus-format-madlad"
                                    value="madlad"
                                    onClick={(e) => {
                                        if (e.target.checked) {
                                            setCorpusFormat("madlad")
                                        }
                                    }}
                                />
                                <label
                                    className={styles["form-check-label"]}
                                    htmlFor="corpus-format-madlad"
                                >
                                    Madlad
                                </label>
                            </div></>}
                    </div>
                    <div className={styles["lang-inputs"]}>
                        <div className={styles["dropdown-cont"]}>
                            <label className={styles["form-label"]} htmlFor="srclang">
                                Source language
                            </label>
                            <DropdownList
                                name="srclang"
                                placeholder="Polish (pl)"
                                id="srclang"
                                data={langList}
                                dataKey="value"
                                value={origin}
                                textField="label"
                                allowCreate="onFilter"
                                onCreate={(value) => handleCreate(value, setOrigin)}
                                onChange={(value) => {
                                    setOrigin(value.value);
                                }}
                                style={
                                    uploadStatus === "UPLOADING" || cmd ? { position: "static" } : {}
                                }
                            />
                        </div>
                        {languageMode !== "mono" ? (
                            <div className={styles["dropdown-cont"]}>
                                <label className={styles["form-label"]} htmlFor="trglang">
                                    Target language
                                </label>
                                <DropdownList
                                    name="trglang"
                                    placeholder="Bosnian (bs)"
                                    id="trglang"
                                    allowCreate="onFilter"
                                    onCreate={(value) => handleCreate(value, setTarget)}
                                    data={langList}
                                    dataKey="value"
                                    value={target}
                                    textField="label"
                                    onChange={(value) => {
                                        setTarget(value.value)
                                    }}
                                    style={
                                        uploadStatus === "UPLOADING" || cmd ? { position: "static" } : {}
                                    }
                                />
                            </div>
                        ) : ""}
                    </div>
                </div>

                <div className={styles["uploader-buttons"]}>
                    <button
                        id="submit-button"
                        className={styles["button-26"]}
                        type="submit"
                        form="upload-form"
                        onClick={(e) => {
                            e.preventDefault();
                            uploadCorpus();
                        }}
                    >
                        Upload
                    </button>
                    <button
                        id="getcmd-button"
                        className={styles["button-27"]}
                        type="submit"
                        form="upload-form"
                        onClick={(e) => {
                            e.preventDefault();
                            getCmd();
                        }}
                    >
                        Get cmd
                    </button>
                </div>
            </form >
            <Footer />
        </div >
    );
}

export async function getServerSideProps() {
    const axios = require("axios");

    const apiBase = process.env.API_URL;
    const apiList = await axios.get(`${apiBase}opus_langs`);

    const list = apiList.data;

    const index = list.languages.indexOf("v1");
    if (index > -1) {
        list.languages.splice(index, 1);
    }

    const languageListing = languagePairName(
        list.languages.filter((el) => el.length === 2)
    );

    return {
        props: { languageList: languageListing },
    };
}
