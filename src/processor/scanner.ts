import { TFile } from 'obsidian';
import { VuepressPublisherSettings } from './../main';

export default class Scanner {
    constructor(public settings: VuepressPublisherSettings) {}

    getCachedPublishFiles() {
        return this.settings.publishedFiles;
    }

    getMarkedFiles(): TFile[] {
        const { publishFolder, excludeFolder = '', publishKey } = this.settings;

        const markedFiles = app.vault.getMarkdownFiles().filter((file: TFile) => {
            const frontMatter = app.metadataCache.getCache(file.path).frontmatter;

            //排除文件夹
            const isInclude = excludeFolder.split(',').some((item) => {
                if (item === '') return false;
                if (file.path.startsWith(item)) {
                    return true;
                }
                return false;
            });

            if (frontMatter && frontMatter[publishKey] === true && file.path.startsWith(publishFolder) && !isInclude) {
                return true;
            }
            return false;
        });
        return markedFiles;
    }

    getFileToPublish() {
        const markedFiles = this.getMarkedFiles();
        const cachedFiles = this.getCachedPublishFiles().filter((cachedFile) => {
            return cachedFile.status != 'Delete';
        });
        const filesToPublish: Array<{
            filePath: string;
            stat: {
                ctime: number;
                mtime: number;
                size: number;
            };
            status: 'Add' | 'Update' | 'Delete' | 'Published';
        }> = [];

        markedFiles.forEach((markedFile: TFile) => {
            const isFileExist = cachedFiles.some((cachedFile) => {
                if (markedFile.path === cachedFile.filePath && markedFile.stat.mtime > cachedFile.stat.mtime) {
                    //文件修改后未发布
                    //console.log("文件已修改", markedFile)
                    filesToPublish.push({
                        filePath: markedFile.path,
                        stat: markedFile.stat,
                        status: 'Update',
                    });
                    return true;
                } else if (markedFile.path === cachedFile.filePath && markedFile.stat.mtime <= cachedFile.stat.mtime) {
                    filesToPublish.push({
                        filePath: markedFile.path,
                        stat: markedFile.stat,
                        status: 'Published',
                    });
                    return true;
                } else {
                    return false;
                }
            });

            if (!isFileExist) {
                //文件没在缓存中
                filesToPublish.push({
                    filePath: markedFile.path,
                    stat: markedFile.stat,
                    status: 'Add',
                });
            }
        });

        cachedFiles.forEach((cachedFile) => {
            const isFileDeleted = markedFiles.every((markedFile) => {
                //文件被删除
                return markedFile.path != cachedFile.filePath;
            });

            if (isFileDeleted) {
                filesToPublish.push({
                    filePath: cachedFile.filePath,
                    stat: cachedFile.stat,
                    status: 'Delete',
                });
            }
        });

        return filesToPublish;
    }
}
