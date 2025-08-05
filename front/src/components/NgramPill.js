import CopyToClipboard from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import { unEscape } from "@/lib/helpers";

import styles from "@/styles/NGramsTable.module.css";

function NgramPill({ n, i, color }) {
    return (
        <CopyToClipboard
            text={unEscape(n[0].join(""))}
            onCopy={() =>
                toast.success("N-Gram copied to clipboard!")
            }
        >
            <div
                className={[styles.pill, styles[`pill-${color}`]].join(
                    " "
                )}
                key={i}
            >
                {unEscape(n[0].join(""))} |{" "}
                {n[1].toLocaleString("en-US")}
            </div>
        </CopyToClipboard>
    )
}

export default NgramPill
