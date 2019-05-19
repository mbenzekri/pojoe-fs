"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const steps_1 = require("pojoe/steps");
const fs = require("fs");
const declaration = {
    gitid: 'mbenzekri/pojoe-fs/steps/DirectoryWatcher',
    title: 'directory change watcher step',
    desc: 'this step emits a pojo for each change in a given directory',
    features: [
        "allow directory change detection",
        "allow regexp filtering for full pathname directories/files",
        "allow change type filtering (create and/or deleted",
    ],
    inputs: {},
    outputs: {
        'files': {
            title: 'changed files or directory',
            properties: {
                "pathname": { type: 'string', title: 'path name of the file or directory' },
                "isdir": { type: 'boolean', title: 'true if pathname is a directory' },
                "isfile": { type: 'boolean', title: 'true if pathname is a file' },
            }
        }
    },
    parameters: {
        'directory': {
            title: 'the directory to watch for changes',
            type: 'string',
            default: 'c:/tmp',
            examples: [
                { value: 'c:/tmp', title: 'set parameter directory to a constant' },
                { value: '$\{args.my_param_name}', title: 'use a process parameter to set directory' },
                { value: '$\{globs.my_glob_name}', title: 'use a step global variable to set directory' },
                { value: '$\{args.root}/$\{globs.prefix}_suffix}', title: 'use mixed variables' },
            ]
        },
        'pattern': {
            title: 'full pathname regexp filter',
            type: 'regexp',
            default: '.*',
            examples: [
                { value: '[.](doc\\|docx)$', title: 'select only doc and docx changes' },
                { value: '^[^C]:', title: 'avoid "C:" starting paths ' },
                { value: '^[A-Z]:', title: 'must be absolute pathname' },
                { value: '.*${globs.asubstr}.*', title: 'must contain a known substring' },
            ]
        },
        'created': {
            title: 'if true output created files',
            type: 'boolean',
            default: 'true',
        },
        'deleted': {
            title: 'if true output deleted files ',
            type: 'boolean',
            default: 'true',
        },
    }
};
class DirectoryWatcher extends steps_1.Step {
    constructor(params) {
        super(declaration, params);
        this.streams = {};
    }
    /**
     * walk recursively a directory and output files mattching pattern and in extension list
     * @param {string} dir : the directory to walk
     * @param {RegExp} pattern : the pattern filter
     * @param {RegExp} extensions : the extension list filter
     */
    doit() {
        return __awaiter(this, void 0, void 0, function* () {
            const directory = this.params.directory;
            process.on('SIGINT', () => {
                console.log("!!! Caught interrupt signal");
                process.exit();
            });
            return new Promise(() => {
                fs.watch(directory, (event, who) => {
                    if (event === 'rename') {
                        const filename = `${directory}/${who}`;
                        const exists = fs.existsSync(filename);
                        const change = exists ? 'create' : 'delete';
                        const stat = fs.statSync(filename);
                        const isdir = stat.isDirectory;
                        const isfile = stat.isFile;
                        const pojo = { filename, change, isdir, isfile };
                        if (this.params.pattern.test(filename)) {
                            if (this.params.created && exists)
                                this.output("files", pojo);
                            if (this.params.deleted && !exists)
                                this.output("files", pojo);
                        }
                    }
                });
            });
        });
    }
}
steps_1.Step.Register(declaration, (params) => new DirectoryWatcher(params));
//# sourceMappingURL=DirectoryWatcher.js.map