// Front Matter 批量修改脚本
// 需要配合 ./config.yml 使用
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const jsonToYaml = require('json2yaml')
const yamlToJs = require('yamljs')
const chalk = require('chalk')
const readFileList = require('./modules/readFileList');
const { type, repairDate } = require('./modules/fn');
const log = console.log
const configPath = path.join(__dirname, 'config.yml')

main();

async function main() {
  const promptList = [{
    type: "confirm",
    message: chalk.yellow('批量操作frontmatter有修改数据的风险，确定要继续吗？'),
    name: "edit",
  }];
  let edit = true;
  const inquirer = (await import('inquirer')).default;
  await inquirer.prompt(promptList).then(answers => {
    edit = answers.edit
  })
  if (!edit) {
    return
  }
  const config = yamlToJs.load(configPath)
  if (type(config.path) !== 'array') {
    log(chalk.red('路径配置有误，path字段应该是一个数组'))
    return
  }
  if (config.path[0] !== 'docs') {
    log(chalk.red("路径配置有误，path数组的第一个成员必须是'docs'"))
    return
  }
  const filePath = path.join(__dirname, '..', ...config.path);
  const files = readFileList(filePath);
  files.forEach(file => {
    let dataStr = fs.readFileSync(file.filePath, 'utf8');
    const fileMatterObj = matter(dataStr)
    let matterData = fileMatterObj.data;
    let mark = false
    if (config.delete) {
      if (type(config.delete) !== 'array') {
        log(chalk.yellow('未能完成删除操作，delete字段的值应该是一个数组！'))
      } else {
        config.delete.forEach(item => {
          if (matterData[item]) {
            delete matterData[item]
            mark = true
          }
        })
      }
    }
    if (type(config.data) === 'object') {
      Object.assign(matterData, config.data)
      mark = true
    }
    if (mark) {
      if (matterData.date && type(matterData.date) === 'date') {
        matterData.date = repairDate(matterData.date)
      }
      const newData = jsonToYaml.stringify(matterData).replace(/\n\s{2}/g, "\n").replace(/"/g, "")
        .split("\n").map(line => line.trimEnd()).join("\n")
        + '---\r\n' + fileMatterObj.content;
      fs.writeFileSync(file.filePath, newData);
      log(chalk.green(`update frontmatter：${file.filePath} `))
    }
  })
}
