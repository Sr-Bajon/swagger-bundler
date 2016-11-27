const sw       = require('swagger-parser');
const YAML     = require('yamljs');
const fs       = require('fs');
const chokidar = require('chokidar');

const parser = new sw();

const conf              = require('./config.json');
const swaggerFileSource = conf.swaggerFileSource;
const editorPathYaml    = conf.editorPathYaml;
const jsonResultPath    = conf.jsonResultPath;
const yamlResultPath    = conf.yamlResultPath;

function separator() {
  console.log(new Array(100).join("="));
}

separator();
// parseSpec();
watch();

function parseSpec() {
  debugger;
  parser.validate(swaggerFileSource)
    .then(function (resolve) {
      console.log('Deferencing');
      return parser.dereference(swaggerFileSource);
    })
    .then(function (deferApi) {
        separator();
        console.log('Escribiendo archivo json desferrenciado');
        fs.writeFileSync(jsonResultPath, JSON.stringify(deferApi, null, 2));
        return deferApi;
      }
    )
    .then(function (deferApi) {
      separator();
      console.log('Escribiendo archivo yaml desrreferenciado');
      let inline     = 20;
      let indent     = 2;
      let yamlBundle = YAML.stringify(deferApi, inline, indent);
      fs.writeFileSync(editorPathYaml, yamlBundle);
      fs.writeFileSync(yamlResultPath, yamlBundle);
      return yamlBundle;
    })
    .then(() => {
      return parser.validate(editorPathYaml)
    })
    .then(() => {
      separator();
      console.log('Archivo YAML resultante valido');
    })
    .catch((err) => {
      separator();
      console.log('Ha ocurrido un error');
      separator();
      console.log(err);
      separator();
    });
}

function watch() {
  let watcher = chokidar.watch(conf.watchFolder, {
    persistent   : true,
    ignoreInitial: true
  });

  watcher
    .on('add', path => {
      separator();
      console.log(`File ${path} has been added`);
      parseSpec();
    })
    .on('change', path => {
      separator();
      console.log(`File ${path} has been changed`);
      parseSpec();
    })
    .on('unlink', path => {
      separator();
      console.log(`File ${path} has been removed`);
      parseSpec();
    })
    .on('ready', () => {
      console.log(`Watcher preparado`);
      separator();
      parseSpec();
    });

}



