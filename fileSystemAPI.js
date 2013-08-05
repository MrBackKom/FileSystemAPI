/**
 * Created with JetBrains WebStorm.
 * User: zhaolong02
 * Date: 12-9-9
 * Time: 下午5:29
 * To change this template use File | Settings | File Templates.
 */

var FileSystem = {};
    FileSystem.API = (function(){

            var API = {};

            var grantedBytes = 1024 * 1024 * 10,
                storeType =  window.PERSISTENT,
                reqFileSystem =  window.requestFileSystem || window.webkitRequestFileSystem;


            //API.rootDir = "dbbrowser";
            API.fileSystem = null;
            API.dirEnty = null;
            API.readyFlag = false;

            API.callbackObject = {};

            //
            //检测是否支持
            API.noSupport = function(){
                if(!reqFileSystem ){
                    return true;
                }
                else{
                    return false;
                }
            };
            API.onFileSystem = function(fs){
                 API.fileSystem = fs;
                 API.readyFlag = true;
                 //alert("FileSystem is ready!");
                 if(API.callbackObject.callback !== undefined){
                     API.callbackObject.callback(API.callbackObject.callbackargs);
                 }
            };

            API.initialize = function(callback,callbackargs){
                if(API.noSupport()){
                    return;
                }
                else{
                    if(callback !== undefined){
                        API.callbackObject.callback = callback;
                        API.callbackObject.callbackargs = callbackargs;
                    }
                    window.webkitRequestFileSystem(storeType, 10 * 1024 * 1024, API.onFileSystem, onError);
                }
            };

            API.initialize();


            API.createFile = function(obj){
                API.fileSystem.root.getFile(obj.fileName, {create: true}, function(fileEntry) {
                        fileEntry.getParent(function(dirEntry){
                            obj.callback && obj.callback(dirEntry);
                        }, onError)
                    },
                    onError
                );
            };

            API.createDir = function(obj){
                API.fileSystem.root.getDirectory(obj.dirName,{create:true},
                    function(dirEntry){
                        console.log("Dir " + obj.dirName + "crate complete!");
                        console.log("Dir " + obj.dirName + "crate complete!!");
                        if(obj.callback){
                            obj.callback();
                        }
                    },
                    onError);
            };

            API.removeDir = function(obj){
                API.fileSystem.root.getDirectory(obj.dirName,{},
                    function(dirEntry){
                        dirEntry.remove(function(){
                            console.log("Dir " + obj.dirName + "crate complete!!");
                            console.log("Dir " + obj.dirName + "crate complete!!");
                            if(obj.callback){
                                obj.callback();
                            }
                        },onError)
                    },
                    onError);
            };

            //
            //删除文件夹及内容
            API.removeDirRecursively = function(obj){
                 API.fileSystem.root.getDirectory(obj.dirName,{},function(dirEntry){
                        dirEntry.removeRecursively(function(){
                            if(obj.callback){
                                obj.callback();
                            }
                        },onError);
                 },onError)
            };

            /**
             * copy a file into folder. eg : '/folder1/me.png', 'folder2/mypics/'
             *
             * @param {object} has tow property 1.fileName  Relative path from the current work dir to a file.
             *                                  2.dirName A name for the duplicated file.
             */
            API.fileCopyTo = function(obj){
                //fileName,dirName,callback
                var that = API,
                    cwd = that.fileSystem.root;
                cwd.getFile(obj.fileName,{},function(fileEntry){
                    cwd.getDirectory(obj.dirName,{},function(dirEntry){
                        fileEntry.copyTo(obj.dirName);
                        console.log(obj.fileName + " :has move to :" +obj.dirName);
                        if(obj.callback){
                            obj.callback();
                        }

                    },onError)
                },onError);
            };

            /**
             * Duplicates a file in it's current folder.
             *
             * @param {object} has two property:1.fileName Relative path from the cwd to a file.
             *                                   2.dirName A name for the duplicated file.
             */
            API.fileDuplicate = function(obj){
                //fileName,fileNewName,callback
                var that = that,
                    cwd = API.fileSystem.root;
                cwd.getFile(obj.fileName,{},function(fileEntry){
                    fileEntry.getParent(function(dirEntry){
                        fileEntry.copyTo(dirEntry,obj.fileNewName,function(copy){
                            console.log("File :" + obj.fileName + "duplicate as" + copy.name);
                            if(obj.callback){
                                obj.callback();
                            }
                        },onError)
                    },onError)
                },onError);
            };


            API.fileRename = function(obj){
                var that = this,
                    cwd = API.fileSystem.root;
                cwd.getFile(obj.fileName,{},function(fileEntry){
                    fileEntry.getParent(function(dirEntry){
                        fileEntry.copyTo(dirEntry,obj.fileNewName,function(copy){
                            fileEntry.remove(function(){
                                if(obj.callback){
                                    obj.callback();
                                }
                            },onError);
                        },onError)
                    },onError)
                },onError);
            }
            /**
             * Moves a file to a different directory.
             *
             * @param {object} has two property 1.fileName Path to a file, relative to the root folder.
             *                                   2.dirName A directory path, relative to the root,
             * to move the file into.
             */
            API.moveTo =function(obj) {
                //obj srcPath, destPath,callback
                var that = this;
                that.fileSystem.root.getFile(obj.fileName, {}, function(fileEntry) {
                    that.fileSystem.root.getDirectory(obj.dirName, {}, function(dirEntry) {
                        fileEntry.moveTo(obj.dirEntry);
                        if(obj.callback){
                            obj.callback();
                        }
                    }, onError);
                }, onError);
            };

            /**
             * Read a file from directory.
             *
             * @param {object} object has two property 1.fileName Path to a file, relative to the root folder.
             *                                          2.callback
             */
            API.readFile = function(obj){
                //fileName,callback
                API.fileSystem.root.getFile(obj.fileName, {}, function(fileEntry) {
                    fileEntry.file(function(file) {
                        var reader = new FileReader();
                        reader.onloadend = function(e) {
                            obj.callback && obj.callback(this.result);
                        };
                        reader.readAsText(file); // Read the file as plaintext.
                    }, onError);
                }, onError);
            };

            /**
             * write content to file .
             *
             * @param {object} object has two property 1.fileName Path to a file, relative to the root folder.
             *                                          2.content what to write
             *                                          3 type 'text/plain'
             */
            API.writeToFile = function(obj){
                //fileName,content,type
                API.fileSystem.root.getFile(fileName,{create:true},function(fileEnrty){
                    fileEnrty.createWriter(function(fileWriter){
                        fileWriter.onwrite = function(e) {
                            console.log(fileName + ' Write completed.');
                            if(obj.callback){
                                obj.callback();
                            }
                        };
                        fileWriter.onerror = function(e) {
                            console.log(fileName + ' Write failed: ' + e.toString());
                        };
                        var bb = new window.WebKitBlobBuilder(); // Create a new Blob on-the-fly.
                        bb.append(obj.content);
                        fileWriter.write(bb.getBlob(obj.type));//'text/plain'
                    },onError)
                },onError);
            };
            /**
             * write to file from directory.
             *
             * @param {object} object has two property 1.fileName Path to a file, relative to the root folder.
             *                                          2.content what to write
             *                                          3 type 'text/plain'
             */
            API.writeToFileFromEnd = function(obj){
                //fileName,content,type,callback
                API.fileSystem.root.getFile(obj.fileName,{},function(fileEntry){
                    fileEntry.createWriter(function(fileWriter){
                        fileWriter.seek(fileWriter.length);

                        fileWriter.onwrite = function(e) {
                            console.log(obj.fileName + ' Write completed.');
                            if(obj.callback){
                                obj.callback();
                            }
                        };
                        fileWriter.onerror = function(e) {
                            console.log(obj.fileName + ' Write failed: ' + e.toString());
                        };
                        var bb = new window.WebKitBlobBuilder(); // Create a new Blob on-the-fly.
                        bb.append(obj.content);
                        fileWriter.write(bb.getBlob('text/plain'));//'text/plain'
                    },onError);
                },onError)
            };

            API.writeToFileByIndex = function(obj){
                API.fileSystem.root.getFile(obj.fileName,{},function(fileEntry){
                    fileEntry.createWriter(function(fileWriter){
                        fileWriter.seek(obj.index);

                        fileWriter.onwrite = function(e) {
                            console.log(obj.fileName + ' Write completed.');
                            if(obj.callback){
                                obj.callback();
                            }
                        };
                        fileWriter.onerror = function(e) {
                            console.log(obj.fileName + ' Write failed: ' + e.toString());
                        };
                        var bb = new window.WebKitBlobBuilder(); // Create a new Blob on-the-fly.
                        bb.append(obj.content);
                        fileWriter.write(bb.getBlob('text/plain'));//'text/plain'
                    },onError);
                },onError)
            };
            /**
             * Writes a Blob to the filesystem.
             *
             * @param {DirectoryEntry} dir The directory to write the blob into.
             * @param {Blob} blob The data to write.
             * @param {string} fileName A name for the file.
             * @param {function(ProgressEvent)} opt_callback An optional callback.
             * Invoked when the write completes.
             */
            var writeBlob = function(obj) {
                //dirEntry, blob, fileName, callback
                obj.dirEntry.getFile(obj.fileName, {create: true}, function(fileEntry) {
                        fileEntry.createWriter(function(writer) {
                            if (obj.callback) {
                                writer.onwrite = obj.callback;
                            }
                            writer.seek(writer.length);
                            writer.write(obj.blob);
                        }, onError);
                },onError);
             };

            //
            //
            API.removeFile = function(obj){
                API.fileSystem.root.getFile(obj.fileName,{},function(fileEntry){
                    fileEntry.remove(function(){
                        console.log("obj.fileName"+ "has been removed!")
                        if(obj.callback !== undefined && typeof obj.callback == "Function"){
                                obj.callback();
                        }
                    },onError);
                },onError)
            };

            API.requireFileSystem = function(callback,callbackargs){
                if(API.readyFlag === true){
                    if(callbackargs == null){
                        callback();
                    }else{
                        callback(callbackargs);
                    }
                }
                else if(API.readyFlag === false){
                    API.initialize(callback,callbackargs);
                }
            };

            function onError(err) {
                var msg = 'Error: ';
                switch (err.code) {
                    case FileError.NOT_FOUND_ERR:
                        msg += 'File or directory not found';
                        break;
                    case FileError.SECURITY_ERR:
                        msg += 'Insecure or disallowed operation';
                        break;
                    case FileError.ABORT_ERR:
                        msg += 'Operation aborted';
                        break;
                    case FileError.NOT_READABLE_ERR:
                        msg += 'File or directory not readable';
                        break;
                    case FileError.ENCODING_ERR:
                        msg += 'Invalid encoding';
                        break;
                    case FileError.NO_MODIFICATION_ALLOWED_ERR:
                        msg += 'Cannot modify file or directory';
                        break;
                    case FileError.INVALID_STATE_ERR:
                        msg += 'Invalid state';
                        break;
                    case FileError.SYNTAX_ERR:
                        msg += 'Invalid line-ending specifier';
                        break;
                    case FileError.INVALID_MODIFICATION_ERR:
                        msg += 'Invalid modification';
                        break;
                    case FileError.QUOTA_EXCEEDED_ERR:
                        msg += 'Storage quota exceeded';
                        break;
                    case FileError.TYPE_MISMATCH_ERR:
                        msg += 'Invalid filetype';
                        break;
                    case FileError.PATH_EXISTS_ERR:
                        msg += 'File or directory already exists at specified path';
                        break;
                    default:
                        msg += 'Unknown Error';
                        break;
                }
                console.log(msg);
            };
        return API;
})();