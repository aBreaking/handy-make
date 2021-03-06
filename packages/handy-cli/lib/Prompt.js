const inquirer = require("inquirer");
const defaultPreset = require("../util/defaultPreset");
const { pkgManagerCheck } = require("handy-utils-shared");

class Prompt {
  constructor(appName, promptsList) {
    this.appName = appName;
    this.confirmList = [];
    this.pluginsCallback = [];
    this.presets = this.presetList();
    this.plugins = ["handy-service"]; // 存贮选择的feature对象的plugin模块
    this.featureList = {
      type: "checkbox",
      name: "features",
      message: "manual select features",
      when: answers => {
        return answers.preset === "manual";
      },
      choices: []
    };
    this.promptBelowFeature = [];
    promptsList.forEach(prompt => {
      prompt(this);
    });
  }

  async confirm() {
    this.confirmList = [
      ...this.presets,
      this.featureList,
      ...this.promptBelowFeature,
      ...this.pkgManagerSelect()
    ];
    let answers = await inquirer.prompt(this.confirmList);
    if (answers.preset === "default") {
      answers = defaultPreset;
    }
    this.pluginsCallback.forEach(fn => {
      fn(answers);
    });
    return {
      answers,
      plugins: this.plugins
    };
  }

  presetList() {
    return [
      {
        type: "list",
        name: "preset",
        message: "select the features include in you app",
        choices: [
          {
            name: "default(eslint,stateManage(normal))",
            value: "default"
          },
          {
            name: "maual select",
            value: "manual"
          }
        ]
      }
    ];
  }

  pkgManagerSelect() {
    if (pkgManagerCheck.hasYarn) {
      return [
        {
          type: "list",
          name: "pkgManager",
          message: "select the manager used to install dependencies",
          when: answers => {
            return answers.preset === "manual";
          },
          choices: [
            {
              name: "npm",
              value: "npm"
            },
            {
              name: "yarn",
              value: "yarn"
            }
          ]
        }
      ];
    }
    return [];
  }

  addFeature(feature) {
    this.featureList.choices.push(feature);
  }

  addChoicesBelowFeature(choice) {
    if (Array.isArray(choice)) {
      this.promptBelowFeature = [...this.promptBelowFeature, ...choice];
    } else {
      this.promptBelowFeature = [...this.promptBelowFeature, choice];
    }
  }

  addPluginsCallback(fn) {
    this.pluginsCallback.push(fn);
  }
}

module.exports = Prompt;
