import { State } from './state';
import link from './rules/link';
import embedlink from './rules/EmbedLink';
import wikiLink from './rules/WikiLink';
import admonition from './rules/admonition';
import chart from './rules/chart';
import codeBlock from './rules/CodeBlock';
import dataview from './rules/dataview';
import embedWikiLink from './rules/EmbedWikiLink';
import text from './rules/text';

const DEFAULT_RULES: Rule[] = [
    { name: 'link', enabled: true, isAsync: false, func: link },
    { name: 'embedLink', enabled: true, isAsync: false, func: embedlink },
    { name: 'wikiLink', enabled: true, isAsync: false, func: wikiLink },
    { name: 'embedWikiLink', enabled: true, isAsync: false, func: embedWikiLink },
    { name: 'admonition', enabled: true, isAsync: false, func: admonition },
    { name: 'chart', enabled: true, isAsync: false, func: chart },
    { name: 'dataview', enabled: true, isAsync: true, asyncFunc: dataview },
    { name: 'codeBlock', enabled: true, isAsync: false, func: codeBlock },
    { name: 'text', enabled: true, isAsync: false, func: text },
];

class Rule {
    name: string;
    enabled: boolean;
    isAsync: boolean;
    func?: (state: State) => boolean;
    asyncFunc?: (state: State) => Promise<boolean>;
}

export class Ruler {
    private rules: Rule[];

    constructor() {
        this.rules = [];
        for (const rule of DEFAULT_RULES) {
            this.rules.push(rule);
        }
    }

    private find(name: string): Rule | null {
        for (const rule of this.rules) {
            if (rule.name == name) {
                return rule;
            }
        }
        return null;
    }

    getRules(): Rule[] {
        const ret: Rule[] = [];
        for (const rule of this.rules) {
            if (rule.enabled) {
                ret.push(rule);
            }
        }
        return ret;
    }

    enable(list: string | string[], ignoreInvalid?: boolean): void {
        if (!Array.isArray(list)) {
            list = [list];
        }
        for (const name of list) {
            const rule = this.find(name);
            if (rule === null) {
                if (ignoreInvalid) {
                    continue;
                }
                throw new Error(`Rules manager: invalid rule name: ${name}`);
            }
            rule.enabled = true;
        }
    }

    enableOnly(list: string | string[], ignoreInvalid?: boolean): void {
        if (!Array.isArray(list)) {
            list = [list];
        }
        this.rules.forEach((rule) => {
            rule.enabled = false;
        });
        this.enable(list, ignoreInvalid);
    }

    disable(list: string | string[], ignoreInvalid?: boolean): void {
        if (!Array.isArray(list)) {
            list = [list];
        }
        for (const name of list) {
            const rule = this.find(name);
            if (rule === null) {
                if (ignoreInvalid) {
                    continue;
                }
                throw new Error(`Rules manager: invalid rule name: ${name}`);
            }
            rule.enabled = false;
        }
    }

    disableOnly(list: string | string[], ignoreInvalid?: boolean): void {
        if (!Array.isArray(list)) {
            list = [list];
        }
        this.rules.forEach((rule) => {
            rule.enabled = true;
        });
        this.enable(list, ignoreInvalid);
    }
}
