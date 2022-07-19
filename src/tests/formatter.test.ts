import Formatter from '../processor/formatter';

const settings = {
    publishFolder: 'docs',
    publishKey: 'publish',
    githubRepo: '',
    githubSSHKey: '',
    githubVuepressConfigFile: '',
    giteeVuepressConfigFile: '',
};

const formatter = new Formatter(settings);

//wiki links
//也有两种方式，一种是文件与文件间的相对路径，另一种是从docs出发的路径。我觉得第二种方式更好一点，ob能直接返回根路径，处理下就能用
//assets links
//vuepress图片路径和config里的base,dirFolder有关，如docs/assets/image.png, 如果base为/obsidian, 则路径为[image](/base/dirFolder/assets/image.png),
//我们默认为最短路径,所以图片默认都传到.vuepress/public路径下，暂时不支持自定义

describe('Links', () => {
    const getLink = () => 'fileFolder/file.md';

    describe('Normal Links', () => {
        test('Normal link to some other page', () => {
            expect(formatter.replaceLink('[file](file)')).toBe('[file](file)');
        });

        test('Normal link to assets', () => {
            expect(formatter.replaceLink('[img](image.png)')).toBe('[img](/image.png)');
        });

        test('Embed link', () => {
            expect(formatter.replaceLink(`![](test.png)`)).toBe(`![](/test.png)`);
            expect(formatter.replaceLink(`![](assets/test.png)`)).toBe(`![](/test.png)`);
        });
    });

    describe('Bidirectional Links and embeds', () => {
        test('Normal bidirectional links', () => {
            expect(formatter.replaceLink('[[file]]', '1.md', getLink)).toBe('[file](docs/fileFolder/file.md)');
        });

        test('Bidirectional Link to Assets', () => {
            expect(formatter.replaceLink('[[image.png]]')).toBe('[image.png](/image.png)');
        });

        test('Bidirectional links within contents', () => {
            expect(formatter.replaceLink('#fewfwe\n- [[file]]\nfewf', '1.md', getLink)).toBe(
                '#fewfwe\n- [file](docs/fileFolder/file.md)\nfewf'
            );
        });

        test('Embed assets', () => {
            expect(formatter.replaceLink(`![[test.png]]`)).toBe(`![test.png](/test.png)`);
            expect(formatter.replaceLink(`![[../../assets/test.png]]`)).toBe(`![test.png](/test.png)`);
        });

        test('Embed asset with alias', () => {
            expect(formatter.replaceLink(`![[test.png|alias]]`)).toBe(`![alias](/test.png)`);
        });

        test('Embed asset with resizing', () => {
            expect(formatter.replaceLink(`![[test.png|200]]`)).toBe(`![test.png](/test.png =200x)`);
            expect(formatter.replaceLink(`![[test.png|200x300]]`)).toBe(`![test.png](/test.png =200x300)`);
        });
    });
});

//admonition
//两种类型，一种有标题，一种没标题

describe('Admonition', () => {
    test('Admonition without title', () => {
        const admonitionTip = `\`\`\`ad-tip
test
\`\`\``;
        expect(formatter.replaceAdmonition(admonitionTip)).toBe(`::: tip
test
:::`);
    });

    test('Admonition with title', () => {
        const admonitionInfo = `\`\`\`ad-info
title: testTitle
test
\`\`\``;
        expect(formatter.replaceAdmonition(admonitionInfo)).toBe(`::: info testTitle
test
:::`);
    });
});

//chart
//describe('Chart', () => {});

//describe('Dataview', () => {});
