// @flow

import type { RunnerConfig } from './types'

const L = require('lodash')
const path = require('path')
const yargs = require('yargs-parser')
const prompt = require('./prompt')
const { availableActions } = require('./help')

const params = async (
  { templates, logger, createPrompter }: RunnerConfig,
  externalArgv: Array<string>
): any => {
  const argv = yargs(externalArgv)
  let [generator, action] = argv._

  if (argv.prompt) {
    logger.log('Asking for generator and action')

    const availableOptions = availableActions(templates)

    const prompter = createPrompter()
    let response = await prompter.prompt({
      type: 'select',
      name: 'generator',
      message: 'Generator?',
      choices: Object.keys(availableOptions)
    })
    generator = response.generator

    response = await prompter.prompt({
      type: 'select',
      name: 'action',
      message: 'Action?',
      choices: availableOptions[generator]
    })
    action = response.action
  }

  if (!generator || !action) {
    return Object.assign({ generator, action, templates })
  }
  const [mainAction, subaction] = L.split(action, ':')

  const actionfolder = path.join(templates, generator, mainAction)
  const promptArgs = await prompt(
    createPrompter,
    actionfolder,
    L.omit(argv, ['_'])
  )
  const args = Object.assign(
    {
      templates,
      actionfolder,
      generator,
      action,
      subaction
    },
    promptArgs,
    L.omit(argv, ['_'])
  )

  return args
}

module.exports = params
