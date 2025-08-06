const fs = require('fs');

// FILE RELATED FUNCTIONS
function readDirectory(path) {
    return fs.readdirSync(path, { withFileTypes: true });
}

function readFile(path) {
    return fs.readFileSync(path, 'utf8');
}

function createJSONFile(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, '  '));
}

const index = {
    v: "3.viper-ide",
    updated: 1728745833,
    packages: []
};
const packages = {};
readDirectory('./packages').filter(val => val.isDirectory()).forEach(dir => {
    index.packages.push({
        name: dir.name,
        homepage: `https//github.com/baztechmy/packages-circuits-my/tree/main/packages/${dir.name}`,
        versions: [{
            version: "latest",
            url: `github:baztechmy/packages-circuits-my/packages/${dir.name}/package.json`
        }]
    });

    const packageDir = readDirectory(`./packages/${dir.name}`);
    const package = !packageDir.map(entry => entry.name).includes('package.json') ? {
        version: "1.0.0",
        urls: []
    } : JSON.parse(readFile(`./packages/${dir.name}/package.json`));
    package.urls = [];

    function traverse(headerPath, path) {
        let files = [];
        const entries = readDirectory(`${headerPath}/${path}`);
        for (const entry of entries) {
            if (entry.isDirectory()) files = [...files, ...traverse(headerPath, `${path}/${entry.name}`)];
            else files.push(`${path}/${entry.name}`);
        }
        return files;
    }

    const files = traverse('./packages', `/${dir.name}`).filter(entry => !entry.endsWith('package.json'));
    package.urls.push(...files.map(val => [val, `github:baztechmy/packages-circuits-my/packages${val}`]));

    packages[`./packages/${dir.name}`] = package;
});

console.log('Created ./index.json...');
createJSONFile('./index.json', index);
Object.entries(packages).forEach(([key, val]) => {
    console.log(`Created ${key}/package.json...`);
    createJSONFile(`${key}/package.json`, val);
});
