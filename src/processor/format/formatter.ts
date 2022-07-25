import { VuepressPublisherSettings } from '../../main';
import { Ruler } from './rulers';
import { State } from './state';

export default class Formatter {
    ruler: Ruler;

    constructor(public settings: VuepressPublisherSettings) {
        this.ruler = new Ruler();
    }

    async formatFile(content: string, sourcePath: string) {
        const state = new State(this, content, sourcePath);
        await this.format(state);
        return state.content;
    }

    async format(state: State) {
        while (state.left < state.right) {
            console.log(state.content.slice(state.left, state.right));
            const rules = this.ruler.getRules();
            for (const rule of rules) {
                const prevLeft = state.left;
                let res: boolean;
                if (!rule.isAsync) {
                    res = rule.func(state);
                } else {
                    res = await rule.asyncFunc(state);
                }
                if (res) {
                    if (prevLeft >= state.left && rule.enabled) {
                        throw new Error(`Formatter: Rule ${rule.name} lead to a dead loop`);
                    }
                    break;
                }
            }
        }
    }
}
