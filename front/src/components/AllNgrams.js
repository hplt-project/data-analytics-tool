import CopyToClipboard from "react-copy-to-clipboard"
import { unEscape } from "@/lib/helpers";
import toast from "react-hot-toast"
import { Copy } from "lucide-react";

import styles from "@/styles/NGramsTable.module.css";


function AllNgrams({ ngrams }) {
    const cleanNgrams = ngrams.map(el => unEscape(el[0].join(""))).join("\n");

    return (
        <CopyToClipboard
            text={cleanNgrams}
            onCopy={() => toast.success("Row N-Grams copied to clipboard!")}
        >
            <td>
                <Copy size={18} strokeWidth={1.6} className={styles.copyIcon} />
            </td>
        </CopyToClipboard>
    )
}

export default AllNgrams
