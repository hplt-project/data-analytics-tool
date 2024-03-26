import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

import { DataFormatter } from "../hooks/hooks";
import { percFormatter } from "../hooks/hooks";

import styles from "@/styles/LangDocs.module.css";

export default function LangDocs({ langDocs }) {
  return (
    <div className={styles.langDocs}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={langDocs}
          margin={{
            top: 30,
            right: 0,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="perc" tickFormatter={percFormatter} />
          <YAxis tickFormatter={DataFormatter} />
          <Tooltip />
          <Bar dataKey="freq" fill="#6d466b">
            <LabelList
              dataKey="freqFormatted"
              fill="#6d466b"
              position="top"
              fontWeight={600}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
