import { copyTextToClipboard } from "@/lib/clipboard";
import { unEscape } from "@/lib/helpers";
import { Copy } from "lucide-react";
import { useToast } from "./ToastProvider";

import styles from "@/styles/NGramsTable.module.css";


function AllNgrams({ ngrams }) {
    const toast = useToast();
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
