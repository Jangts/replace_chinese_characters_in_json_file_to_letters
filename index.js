const fs = require('fs')
const path = require('path')
const pinyin = require('pinyin')
const args = process.argv.slice(2)

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

function scanJSONFiles(root) {
    const res = [], files = fs.readdirSync(root)
    files.forEach(function (filename) {
        const fullname = path.resolve(root, filename),
            stat = fs.lstatSync(fullname)
        if (!stat.isDirectory()) {
            // console.log(filename)
            if (/\.json$/.test(filename)) {
                res.push({
                    filename,
                    fullname
                })
            }
        } else {
            // 不处理子目录的业务
            // res = res.concat(getAllFiles(pathname))
        }
    })
    return res
}

function readAndReplaceFileContent(infile, outfile) {
    // console.log(infile, outfile)

    fs.readFile(infile, 'utf-8', function (err, data) {
        if (err) {
            console.log("error");
        } else {
            // console.log(data)
            const newData = normalize(data)
            // console.log(newData)
            fs.writeFileSync(outfile, newData)
        }
    })
}

function normalize(input) {
    let result = ''
    for (let i = 0; i < input.length; i++) {
        const charcode = input.charCodeAt(i)
        const char = input.charAt(i)
        if (charcode > 0x4E00 && charcode < 0x9FA5) {
            // console.log(pinyin(char, true, '')[0][0][0])
            result += pinyin(char, true, '')[0][0][0].toLowerCase()
        } else if(char!==' ') {
            result += char
        }
    }
    return result
}

function main() {
    if (args.length > 0 && typeof args[0] === 'string') {
        let [indir, outdir] = args.map(dir => path.resolve(__dirname, dir))
        if (typeof outdir !== 'string') {
            outdir = path.resolve(indir, './out')
        }
        console.log(indir, outdir)
        if (fs.existsSync(indir)) {
            if (!fs.existsSync(outdir)) {
                mkdirsSync(outdir)
            }
            const files = scanJSONFiles(indir)
            // console.log(files)
            files.forEach(file => readAndReplaceFileContent(file.fullname, path.resolve(outdir, file.filename)))
        }
        else {
            throw Error('Assigned input dir not exists')
        }
    }
    else {
        throw Error('Must assign an input dir')
    }
}

main()