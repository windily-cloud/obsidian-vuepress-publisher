import { State } from '../state';
import yaml from 'js-yaml';

export default function chart(state: State): boolean {
    const content = state.content;
    const chartPattern = /(?<separator>```+)chart\n(?<code>[\s\S]*?)\n?\k<separator>/uy;
    chartPattern.lastIndex = state.left;
    const exec = chartPattern.exec(content);
    if (exec === null || exec.groups === undefined) return false;
    const { code } = exec.groups;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any, replace: string;
    try {
        data = yaml.load(code.replace(/	/g, '    '));
    } catch (error) {
        replace = `<div class="chart-error" style="padding: 1rem;border-radius: 1rem;">
<b> Couldn't render Chart:</b>
<pre><code>${error.toString()}</code></pre>
</div>`;
        state.content = content.slice(0, state.left) + replace + content.slice(state.left + exec[0].length);
        state.left += replace.length;
        return true;
    }

    if (!data.id) {
        if (!data || !data.type || !data.labels || !data.series) {
            replace = `<div class="chart-error" style="padding: 1rem;border-radius: 1rem;">
<b> Couldn't render Chart:</b>
<pre><code>Missing type, labels or series</code></pre>
</div>`;
            state.content = content.slice(0, state.left) + replace + content.slice(state.left + exec[0].length);
            state.left += replace.length;
            return true;
        }
    }

    replace = `::: chart

\`\`\`json
${JSON.stringify(content, null, 4)}
\`\`\`

:::
`;

    state.content = content.slice(0, state.left) + replace + content.slice(state.left + exec[0].length);
    state.left += replace.length;
    console.log('chart', state.content, replace);
    return true;
}
