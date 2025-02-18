import styles from "@/styles/NoiseDistributionGraph.module.css";
import React from "react";
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
import { percFormatter } from "../../hooks/hooks";

export default function NoiseDistributionGraph({ noiseData }) {
  const numbers = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return (
    <div className={styles.noiseDistributionGraphContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          width={300}
          height={200}
          data={noiseData}
          margin={{
            top: 5,
            right: 50,
            left: 50,
            bottom: 15,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            type="number"
            tickFormatter={percFormatter}
            ticks={numbers}
            fontSize={12}
          />
          <YAxis
            dataKey="label"
            type="category"
            fontSize={10}
            tickFormatter={(value) =>
              value.toLocaleString().replace(/ /g, "\u00A0")
            }
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#D99002" name="% of corpus">
            {" "}
            <LabelList
              dataKey="perc"
              position="right"
              fontWeight={500}
              fill="#D99002"
              tickFormatter={(value) =>
                value.toLocaleString().replace(/ /g, "\u00A0")
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
