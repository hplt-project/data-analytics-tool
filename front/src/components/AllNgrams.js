import { copyTextToClipboard } from "@/lib/clipboard";
import { unEscape } from "@/lib/helpers";
import toast from "react-hot-toast"
import { Copy } from "lucide-react";

import styles from "@/styles/NGramsTable.module.css";


function AllNgrams({ ngrams }) {
    const cleanNgrams = ngrams.map(el => unEscape(el[0].join(""))).join("\n");
    const handleCopy = async () => {
        try {
            await copyTextToClipboard(cleanNgrams);
            toast.success("Row N-Grams copied to clipboard!");
        } catch {
            toast.error("Couldn't copy row N-Grams");
        }
    };

    return (
        <td>
            <button className={styles.copyButton} onClick={handleCopy} type="button">
                <Copy size={18} strokeWidth={1.6} className={styles.copyIcon} />
            </button>
        </td>
    )
}

export default AllNgrams
