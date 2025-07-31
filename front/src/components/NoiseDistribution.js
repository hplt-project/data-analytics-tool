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
import { percFormatter } from "@/lib/helpers";
import InfoCircle from "./InfoCircle";
import { Tooltip as InfoTooltip } from "react-tooltip";

import styles from "@/styles/NoiseDistributionGraph.module.css";

export default function NoiseDistribution({
  noiseData,
  sentences,
  trglang,
  footNote,
}) {
  const numbers = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return (
    <div className="custom-chart">
      <div className={styles.title}>
        <h3 className={styles.noiseDistributionTitle}>
          Segment {trglang && "pair"} noise distribution
        </h3>
        <a className="noise-info">{!footNote && <InfoCircle />}</a>
        <InfoTooltip anchorSelect=".noise-info" place="top">
          Obtained with Bicleaner Hardrules (
          <a
            className={styles.tooltipLink}
            href="https://github.com/bitextor/bicleaner-hardrules/"
            target="_blank"
          >
            https://github.com/bitextor/bicleaner-hardrules/
          </a>
          )
        </InfoTooltip>
      </div>
      <div className={styles.container}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            width={300}
            height={200}
            data={noiseData}
            margin={{
              top: 0,
              right: 50,
              left: 30,
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
              dataKey={(el) => {
                const value = el[0];
                return value === "not_too_long"
                  ? "Too long"
                  : value === "not_too_short"
                    ? "Too short"
                    : value === "no_urls"
                      ? "URLs"
                      : value === "no_bad_encoding"
                        ? "Bad encoding"
                        : value === "length_ratio"
                          ? "Length ratio"
                          : value === "pii"
                            ? "Contains PII"
                            : value === "no_porn"
                              ? "No porn"
                              : "";
              }}
              type="category"
              fontSize={12}
            />
            <Tooltip />
            <Legend />
            <Bar
              dataKey={(val) =>
                +parseFloat((val[1] * 100) / sentences).toFixed(2)
              }
              fill="#D99002"
              name="% of corpus"
            >
              <LabelList
                dataKey={(val) =>
                  `${((val[1] * 100) / sentences).toFixed(2)} %`
                }
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
    </div>
  );
}
