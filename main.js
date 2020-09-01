const fs = require('fs')
const path = require('path')
const pinyin = require('pinyin')
// const inquirer = require('inquirer')
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

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
        } else if (char !== ' ') {
            result += char
        }
    }
    return result
}

// const questions = [
//     {
//         type: 'input',
//         name: 'indir',
//         message: "请输入你的JSON源文件夹路径:"
//     },
//     {
//         type: 'input',
//         name: 'outdir',
//         message: "请输入你的JSON目标文件夹路径(留空则在源文件夹中创建out目录):"
//     }
// ]

// function main_inquirer() {
//     inquirer.prompt(questions).then(answers => {
//         let { indir, outdir } = answers
//         indir = indir.replace(/(^\s+|\\|\s+$)/g, '')
//         if (indir) {
//             console.log(indir)
//             indir = path.resolve(__dirname, indir)
//             outdir = outdir.replace(/(^\s+|\\|\s+$)/g, '')

//             if (outdir) {
//                 outdir = path.resolve(__dirname, outdir)
//             }
//             else {
//                 outdir = path.resolve(indir, './out')
//             }

//             // console.log(indir, outdir)
//             if (fs.existsSync(indir)) {
//                 if (!fs.existsSync(outdir)) {
//                     mkdirsSync(outdir)
//                 }
//                 const files = scanJSONFiles(indir)
//                 files.forEach(file => readAndReplaceFileContent(file.fullname, path.resolve(outdir, file.filename)))
//                 console.log('完成替换。你可以继续替换其他文件或退出程序。')
//                 main()
//             }
//             else {
//                 console.warn(`Assigned input dir [${indir}] not exists.`)
//                 console.log('请重新输入源文件夹路径或退出程序。')
//                 main()
//             }
//         }
//         else {
//             console.warn(`Must assign input dir.`)
//             console.log('请重新输入源文件夹路径或退出程序。')
//             main()
//         }
//     })
// }

function main_readline() {
    readline.question(`请输入你的JSON源文件夹:`, indir => {
        indir = path.resolve(__dirname, indir.replace(/(^\s+|\\|\s+$)/g), '')
        readline.question(`请输入你的JSON目标文件夹(留空则在源文件夹中创建out目录):`, outdir => {
            outdir = outdir.replace(/(^\s+|\\|\s+$)/g, '')
            if (outdir) {
                outdir = path.resolve(__dirname, outdir)
            }
            else {
                outdir = path.resolve(indir, './out')
            }
            if (fs.existsSync(indir)) {
                if (!fs.existsSync(outdir)) {
                    mkdirsSync(outdir)
                }
                const files = scanJSONFiles(indir)
                files.forEach(file => readAndReplaceFileContent(file.fullname, path.resolve(outdir, file.filename)))
                console.log('完成替换。你可以继续替换其他文件或退出程序。')
                main()
            }
            else {
                throw Error(`Assigned input dir [${indir}] not exists`)
            }
        })
    })
}

function main() {
    // main_inquirer()
    main_readline()
}

main()