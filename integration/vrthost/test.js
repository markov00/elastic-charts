/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const fs = require('fs');
const { relative, join, dirname } = require('path');

const _ = require('lodash');
const slugify = require('slugify');
const ts = require('typescript');

const readdirSync = (p, a = []) => {
  if (fs.statSync(p).isDirectory()) fs.readdirSync(p).map((f) => readdirSync(a[a.push(join(p, f)) - 1], a));
  return a;
};

function extractPaths() {
  console.log('extractPaths...', process.cwd());
  const files = readdirSync('stories').filter((item) => _.includes(item, '.stories.ts'));
  console.log('files', files.length);

  const mods = new Map();
  files.forEach((file) => {
    const exportedFiles = [];
    let mainExportName = '';
    // https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#using-the-type-checker
    // Build a program using the set of root file names in fileNames
    const program = ts.createProgram([file], {
      module: ts.ModuleKind.ES2015,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES5,
    });
    // Get the checker, we will use it to find more about classes
    const checker = program.getTypeChecker();
    // Visit every sourceFile in the program
    program
      .getSourceFiles()
      .filter((sourceFile) => _.includes(sourceFile.fileName, file))
      .forEach((sourceFile) => {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, (node) => {
          if (node.kind === ts.SyntaxKind.ExportAssignment) {
            mainExportName = node.expression.properties.find((p) => p.name.escapedText === 'title').initializer.text;
          }
          if (node.kind === ts.SyntaxKind.ExportDeclaration) {
            exportedFiles.push({
              file: node.moduleSpecifier.text,
              exportName: node.exportClause.elements[0].name.escapedText,
            });
          }
        });
      });
    mods.set(file, {
      mainExportName,
      exportedFiles,
    });
  });

  function getPathFromStoriesIndex(module, mainFilename) {
    const title = slugify(module.mainExportName.toLowerCase().split('/').join('-'), { lower: true, strict: true });
    return module.exportedFiles.reduce((acc, data) => {
      const namePath = data.exportName
        .replace(/([A-Z])/g, '-$1')
        .trim()
        .toLocaleLowerCase();
      const slugName = slugify(namePath, { lower: true, strict: true });
      const path = `/story/${title}--${slugName}`;
      acc[path] = join(relative(process.cwd(), dirname(mainFilename)), data.file);
      return acc;
    }, {});
  }

  let allPaths = {};

  mods.forEach((value, key) => {
    const paths = getPathFromStoriesIndex(value, key);
    allPaths = { ...allPaths, ...paths };
  });
  return allPaths;
}

function lazyImportTemplate(index, modulePath) {
  return `
const Component${index} = React.lazy(() => {
  return import('${modulePath}').then((module) => {
    return { default: module.Example };
  });
});`;
}

function routeComponentTemplate(index, urlPath) {
  return `{path === '${urlPath}' && <Component${index} />}`;
}

module.exports = function compileVRTServerIndex() {
  const paths = extractPaths();

  const templates = Object.keys(paths).reduce(
    (acc, urlPath, index) => {
      const modulePath = paths[urlPath];
      acc.imports.push(lazyImportTemplate(index, modulePath));
      acc.routes.push(routeComponentTemplate(index, urlPath));
      return acc;
    },
    { imports: [], routes: [] },
  );
  const playgroundFileText = `import React, { Suspense } from 'react';
${templates.imports.join('\n')}
export function Playground() {
  const path = new URL(window.location.toString()).searchParams.get('path');
  return (
    <Suspense fallback={<div>Loading...</div>}>
     ${templates.routes.join('\n     ')}
    </Suspense>
  );
}
  `;
  fs.writeFileSync('./playground.tsx', playgroundFileText);
};
