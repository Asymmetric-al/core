import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const reportPath = path.resolve('playwright-report/results.json')

const runPlaywright = () =>
  new Promise((resolve) => {
    if (fs.existsSync(reportPath)) {
      fs.rmSync(reportPath, { force: true })
    }

    const projects = process.env.VERIFY_E2E_PROJECTS
    const args =
      projects === 'all' ? ['run', 'test:e2e'] : ['run', 'test:e2e', '--project=chromium']
    const child = spawn('bun', args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: process.env,
    })

    child.stdout.on('data', (chunk) => {
      process.stderr.write(chunk)
    })
    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk)
    })

    child.on('error', () => resolve(1))
    child.on('close', (code) => resolve(code ?? 1))
  })

const isFailureStatus = (status) =>
  status === 'failed' || status === 'timedOut' || status === 'interrupted'

const getErrorMessage = (result) => {
  const error = result?.error || result?.errors?.[0]
  if (!error) return 'Unknown error'
  return error.message || error.value || error.stack || 'Unknown error'
}

const collectAttachments = (result) => {
  const attachments = Array.isArray(result?.attachments) ? result.attachments : []
  const trace = attachments.find(
    (attachment) =>
      attachment.name?.toLowerCase().includes('trace') ||
      attachment.path?.toLowerCase().endsWith('.zip'),
  )
  const video = attachments.find(
    (attachment) =>
      attachment.name?.toLowerCase().includes('video') ||
      attachment.path?.toLowerCase().endsWith('.webm'),
  )
  return { tracePath: trace?.path, videoPath: video?.path }
}

const collectFailures = (suite, parents = []) => {
  const failures = []
  const nextParents = suite?.title ? [...parents, suite.title] : parents

  for (const childSuite of suite?.suites || []) {
    failures.push(...collectFailures(childSuite, nextParents))
  }

  for (const spec of suite?.specs || []) {
    const testTitleBase = [...nextParents, spec.title].filter(Boolean).join(' > ')
    for (const test of spec.tests || []) {
      const result =
        (test.results || []).find((entry) => isFailureStatus(entry.status)) || null
      const status = test.status || result?.status
      if (!isFailureStatus(status)) continue
      const { tracePath, videoPath } = collectAttachments(result)
      failures.push({
        test: testTitleBase,
        message: getErrorMessage(result),
        file: spec.file,
        line: spec.line || 0,
        ...(tracePath ? { tracePath } : {}),
        ...(videoPath ? { videoPath } : {}),
      })
    }
  }

  return failures
}

const collectFailuresFromReport = (report) => {
  const suites = Array.isArray(report?.suites) ? report.suites : null
  if (suites) {
    return suites.flatMap((suite) => collectFailures(suite))
  }
  return collectFailures(report)
}

const main = async () => {
  const exitCode = await runPlaywright()
  let report = null
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
  } catch (error) {
    const summary = {
      ok: false,
      failed: [
        {
          test: 'playwright-report',
          message: 'Failed to read JSON report. Check stderr for Playwright output.',
          file: reportPath,
          line: 0,
        },
      ],
      artifacts: { reportPath },
    }
    process.stdout.write(`${JSON.stringify(summary)}\n`)
    process.exit(exitCode || 1)
  }

  const failures = collectFailuresFromReport(report)
  const traces = failures.map((failure) => failure.tracePath).filter(Boolean)
  const videos = failures.map((failure) => failure.videoPath).filter(Boolean)

  const summary = {
    ok: failures.length === 0,
    failed: failures,
    artifacts: {
      reportPath,
      ...(traces.length ? { traces } : {}),
      ...(videos.length ? { videos } : {}),
    },
  }

  process.stdout.write(`${JSON.stringify(summary)}\n`)
  process.exit(summary.ok ? 0 : 1)
}

main()
