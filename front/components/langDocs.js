import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	LabelList,
} from "recharts";

import { DataFormatter } from "../hooks/hooks";
import { percFormatter } from "../hooks/hooks";

import styles from "@/styles/LangDocs.module.css";

const CustomTooltip = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
		return (
			<div className={styles.tooltip}>
				<p className={styles.label}>{`${label}% of segments in ${srclang}</p>
				{payload.map((item, idx) => {
					return (
						<p
							key={idx}
							className={styles.desc}
							style={{ color: item.fill }}
						>{`Documents: ${item.payload.freq.toLocaleString("en-US")} `}</p>
					);
				})}
			</div>
		);
	}

	return null;
};

export default function LangDocs({ langDocs }) {
	const numbers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

	return (
		<div className={styles.langDocs}>
			<ResponsiveContainer width="100%" height="100%" >
				<BarChart
					height={300}
					data={langDocs}
					margin={{
						top: 32,
						right: 20,
						left: 10,
						bottom: 15,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="perc"
						tickFormatter={percFormatter}
						label={{
							value: "Segments (Percentage)",
							angle: 0,
							position: "bottom",
							offset: 0,
							fontSize: 14,
						}}
						ticks={numbers}
						type="number"
						fontSize={12}
						padding={{ left: 30, right: 30 }}
						allowDecimals
					/>
					<YAxis
						tickFormatter={DataFormatter}
						label={{
							value: "Documents",
							angle: 0,
							position: "top",
							offset: 12,
							fontSize: 14,
						}}
						fontSize={12}
					/>
					<Tooltip
						content={<CustomTooltip />}
						wrapperStyle={{ outline: "none" }}
					/>
					<Bar dataKey="freq" fill="#6d466b" maxBarSize={50}>
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
