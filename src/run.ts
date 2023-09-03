import * as core from '@actions/core'
import * as github from '@actions/github'
import { aggregate } from './aggregate'
import { listDeployments } from './queries/listDeployments'

type Inputs = {
  owner: string
  repo: string
  sha: string
  token: string
}

type Outputs = {
  progressing: boolean
  completed: boolean
  succeeded: boolean
  summary: string
}

export const run = async (inputs: Inputs): Promise<Outputs> => {
  const octokit = github.getOctokit(inputs.token)

  core.info(`Get deployments at ${inputs.sha}`)
  const deployments = await listDeployments(octokit, {
    owner: inputs.owner,
    name: inputs.repo,
    expression: inputs.sha,
  })
  core.startGroup(`listDeployments(sha: ${inputs.sha})`)
  core.info(JSON.stringify(deployments, undefined, 2))
  core.endGroup()

  const outputs = aggregate(deployments)
  core.startGroup('outputs')
  core.info(JSON.stringify(outputs, undefined, 2))
  core.endGroup()
  return {
    ...outputs,
    summary: outputs.summary.join('\n'),
  }
}
