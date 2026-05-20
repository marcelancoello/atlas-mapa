import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";

export function CompetencyRadar({ data }: { data: Array<{ name: string; actual: number; expected: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis dataKey="name" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
        <PolarRadiusAxis domain={[0, 4]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} stroke="var(--color-border)" />
        <Radar name="Esperado" dataKey="expected" stroke="var(--color-muted-foreground)" fill="var(--color-muted-foreground)" fillOpacity={0.15} />
        <Radar name="Actual" dataKey="actual" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.4} />
        <Legend wrapperStyle={{ color: "var(--color-muted-foreground)", fontSize: 12 }} />
        <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
