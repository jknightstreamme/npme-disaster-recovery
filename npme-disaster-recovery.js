#!/usr/bin/env node

var glob = require('glob');
var tar = require('tar'),
    path = require('path'),
    tmp = require('tmp'),
    targz = require('targz'),
    fs = require('fs');

var cprocess = require('child_process');
var spawn =  cprocess.spawnSync;



/*
    Configured settings
 */

var packages_path = '/tmp/npm-onsite-sample/'


var user_glob_string = '*'

var global_glob_string = '/**/*.tgz';
var glob_string = user_glob_string + global_glob_string;

var npm_username = 'recoveryUser',
    npm_password = 'recoveryPass',
    npm_email = 'npm@stream.me'
    npm_registry_server = '';

var npm_login = require('npm-cli-login');



npm_config();
npm_whoami();
npm_login(npm_username, npm_password, npm_email);
npm_whoami();
npm_config();

glob.glob(glob_string, {cwd: packages_path}, function(err, files) {
    if(err) {
        console.error(err);
        return;
    }
    if(files.length > 0) {
        tar_files = []
        files.forEach(function(f) {
            tar_files.push(f)
            console.log('found file: ' + f);
            console.log('added file ' + f + ' to queue')
        });

        tar_files.forEach(function(f){
            // make tmp dir
            var tar_filename = packages_path + f

            var tmp_path = tmp.dirSync();
            var untar_path = tmp_path.name
            console.log('temp path: '+ tmp_path.name);

            targz.decompress({
                src: tar_filename,
                dest: untar_path
            }, function(err, value){
                if(err) {
                    console.error(err);
                } else {
                    console.log(tar_filename + ': done! ('+ untar_path +')');
                    publish_package(untar_path + '/package')
                    deleteFolderRecursive(tmp_path.name);
                }
            });

        });

    } else {
        console.log('no files found');
    }


});


function npm_whoami() {
    var npm_whoami_result = spawn('npm', ['whoami']);
    console.log('whoami output: '+ npm_whoami_result.stdout)
}

function npm_config() {
    var npm_config_result = spawn('npm', ['config', 'list']);
    console.log('whoami output: '+ npm_config_result.stdout)
}

var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        function npm_user() {

        }

        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


function publish_package(pkg_dir) {
    var current_dir = process.cwd();
    process.chdir(pkg_dir);
    var npm_publish_result = spawn('npm', ['publish'], {
        cwd: pkg_dir
    });
    console.log('output: '+ npm_publish_result.stdout)
    console.log('error: '+ npm_publish_result.stderr)

    process.chdir(current_dir);
}
