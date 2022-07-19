import { AxiosInstance } from 'axios';
import { VuepressPublisherSettings } from './../main';
import axios from 'axios';

interface CloudConfigType {
    [key: string]: {
        baseUrl: string;
    };
}

const cloudConfig: CloudConfigType = {
    github: {
        baseUrl: 'https://api.github.com/',
    },
    gitee: {
        baseUrl: 'https://gitee.com/api/v5/',
    },
};

export default class Publisher {
    private service: AxiosInstance;
    constructor(private settings: VuepressPublisherSettings, private publisherType: 'github' | 'gitee') {
        const SSHKey = this.publisherType === 'github' ? this.settings.githubSSHKey : this.settings.giteeSSHKey;
        this.service = axios.create({
            baseURL: cloudConfig[this.publisherType].baseUrl,
            withCredentials: false,
            timeout: 6000,
        });

        this.service.interceptors.request.use(
            (config) => {
                if (!SSHKey) {
                    return new Error('SSHKey does not exist!');
                }

                config.headers['Authorization'] = 'token ' + SSHKey;
                return config;
            },
            (err) => {
                return Promise.reject(err);
            }
        );

        this.service.interceptors.response.use(
            (res) => {
                return res;
            },
            () => {
                return;
            }
        );
    }

    async validateGitHubRepo(): Promise<boolean> {
        const repo = this.settings.githubRepo;
        try {
            const res = await this.service({
                url: `/repos/${repo}`,
                method: 'get',
            });
            if (res.status === 200) {
                return true;
            }
        } catch {
            return false;
        }
    }

    private async isGithubFileExist(targetPath: string): Promise<boolean> {
        const repo = this.settings.githubRepo;
        try {
            const res = await this.service({
                url: `/repos/${repo}/contents/${targetPath}`,
                method: 'get',
            });
            if (res.status != 200) return false;
            return true;
        } catch {
            return false;
        }
    }

    async createGithubFile(content: string, targetPath: string) {
        const repo = this.settings.githubRepo;
        const createContentsRes = await this.service({
            url: `/repos/${repo}/contents/${targetPath}`,
            method: 'put',
            data: {
                message: `Create ${targetPath}.`,
                content: Buffer.from(content, 'utf-8').toString('base64'),
            },
        });

        console.log(createContentsRes);

        if (createContentsRes.status != 201) {
            return Promise.reject(`Error Code ${createContentsRes.status}. ${createContentsRes.statusText}`);
        }

        return Promise.resolve(`Created ${targetPath}`);
    }

    async updateGithubFile(content: string, targetPath: string) {
        const repo = this.settings.githubRepo;
        const fileRes = await this.isGithubFileExist(targetPath);
        if (fileRes) {
            const res = await this.service({
                url: `/repos/${repo}/contents/${targetPath}`,
                method: 'get',
            });
            //找到文件，更新文件
            const { sha, type } = res.data;
            if (type !== 'file') {
                return Promise.reject('Content already exist and is not a file.');
            }

            const updateContentsRes = await this.service({
                url: `/repos/${repo}/contents/${targetPath}`,
                method: 'put',
                data: {
                    message: `Update ${targetPath}.`,
                    content: Buffer.from(content, 'utf-8').toString('base64'),
                    sha,
                },
            });
            if (updateContentsRes.status != 200) {
                return Promise.reject(`Error Code ${updateContentsRes.status}. ${updateContentsRes.statusText}`);
            }

            return Promise.resolve(`Updated ${targetPath}`);
        } else {
            return Promise.reject(`File ${targetPath} not exists!`);
        }
    }

    async deleteGithubFile(targetPath: string) {
        const repo = this.settings.githubRepo;
        const fileRes = await this.isGithubFileExist(targetPath);
        if (!fileRes) {
            return Promise.reject('File does not exist!');
        }
        const res = await this.service({
            url: `/repos/${repo}/contents/${targetPath}`,
            method: 'get',
        });

        const { sha, type } = res.data;
        if (type !== 'file') {
            return Promise.reject('Content already exist and is not a file.');
        }
        const deleteFileRes = await this.service({
            url: `/repos/${repo}/contents/${targetPath}`,
            method: 'delete',
            data: {
                message: `Delete ${targetPath}`,
                sha,
            },
        });

        if (deleteFileRes.status != 200) {
            return Promise.reject(`Error Code ${deleteFileRes.status}. ${deleteFileRes.statusText}`);
        }
        return Promise.resolve(`Deleted ${targetPath}`);
    }
}
