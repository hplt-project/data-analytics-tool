import styles from "@/styles/NGramsTable.module.css";
import NgramPill from "./NgramPill";
import { Copy } from "lucide-react";
import { Toaster } from "react-hot-toast";
import AllNgrams from "./AllNgrams";

export default function NGramsTable({ NGrams }) {
  if (!NGrams) return;
  return (
    <div className={styles.nGramsTableContainer}>
      <Toaster />
      <table>
        <thead>
          <tr className={styles.firstRow}>
            <th className={styles.nunberHeader}>Size</th>
            <th>n-grams</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(NGrams)[0] && (
            <tr>
              <td>1</td>
              <td>
                {Object.entries(NGrams)[0][1].map((n, i) => {
                  return <NgramPill n={n} i={i} color={"yellow"} />;
                })}
              </td>
              <AllNgrams ngrams={Object.entries(NGrams)[0][1]} />
            </tr>
          )}
          {Object.entries(NGrams)[1] && (
            <tr>
              <td>2</td>
              <td>
                {Object.entries(NGrams)[1][1].map((n, i) => {
                  return <NgramPill n={n} i={i} color={"blue"} />;
                })}
              </td>
              <AllNgrams ngrams={Object.entries(NGrams)[1][1]} />
            </tr>
          )}
          {Object.entries(NGrams)[2] && (
            <tr>
              <td>3</td>
              <td>
                {Object.entries(NGrams)[2][1].map((n, i) => {
                  return <NgramPill n={n} i={i} color={"red"} />;
                })}
              </td>
              <AllNgrams ngrams={Object.entries(NGrams)[2][1]} />
            </tr>
          )}
          {Object.entries(NGrams)[3] && (
            <tr>
              <td>4</td>
              <td>
                {Object.entries(NGrams)[3][1].map((n, i) => {
                  return <NgramPill n={n} i={i} color={"teal"} />;
                })}
              </td>
              <AllNgrams ngrams={Object.entries(NGrams)[3][1]} />
            </tr>
          )}
          {Object.entries(NGrams)[4] && (
            <tr>
              <td>5</td>
              <td>
                {Object.entries(NGrams)[4][1].map((n, i) => {
                  return <NgramPill n={n} i={i} color={"purple"} />;
                })}
              </td>
              <AllNgrams ngrams={Object.entries(NGrams)[4][1]} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
