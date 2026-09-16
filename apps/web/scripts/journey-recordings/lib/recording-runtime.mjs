import { spawnSync } from 'node:child_process'
import { mkdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { chromium } from '@playwright/test'

export async function recordJourney({
  appDirectory,
  artifactSlug,
  documentFileNames = [],
  journey,
  pdfFileName,
  run,
  viewport = { height: 900, width: 1600 },
}) {
  const baseUrl = process.env.JOURNEY_BASE_URL ?? 'http://127.0.0.1:5173'
  const artifactDirectory = path.join(appDirectory, 'artifacts/journey-recordings', artifactSlug)
  const rawVideoDirectory = path.join(artifactDirectory, 'raw')
  const webmPath = path.join(artifactDirectory, `${artifactSlug}.webm`)
  const mp4Path = path.join(artifactDirectory, `${artifactSlug}.mp4`)
  const pdfPath = pdfFileName ? path.join(artifactDirectory, pdfFileName) : undefined
  const documentPaths = documentFileNames.map((fileName) => path.join(artifactDirectory, fileName))
  const reportPath = path.join(artifactDirectory, 'recording-report.json')

  await assertApplicationIsAvailable(baseUrl)
  await rm(artifactDirectory, { force: true, recursive: true })
  await mkdir(rawVideoDirectory, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    colorScheme: 'light',
    recordVideo: {
      dir: rawVideoDirectory,
      size: viewport,
    },
    reducedMotion: 'no-preference',
    viewport,
  })
  const page = await context.newPage()
  const video = page.video()
  const browserErrors = []

  page.on('console', (message) => {
    if (message.type() === 'error') {
      browserErrors.push(`console: ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => {
    browserErrors.push(`page: ${error.message}`)
  })

  try {
    await run({
      artifactDirectory,
      baseUrl,
      documentPaths,
      page,
      pdfPath,
    })
  } catch (error) {
    await page.screenshot({
      fullPage: true,
      path: path.join(artifactDirectory, 'recording-failure.png'),
    })
    throw error
  } finally {
    await page.close()
    await context.close()
    await browser.close()
  }

  const recordedPath = await video.path()
  await rename(recordedPath, webmPath)
  const conversion = convertToMp4(webmPath, mp4Path)
  const videoStats = await stat(conversion.outputPath)
  const pdfStats = pdfPath ? await stat(pdfPath) : undefined
  const documentStats = await Promise.all(
    documentPaths.map(async (documentPath) => ({
      path: path.relative(appDirectory, documentPath),
      sizeBytes: (await stat(documentPath)).size,
    })),
  )

  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        browserErrors,
        createdAt: new Date().toISOString(),
        durationStyle: 'guided',
        journey,
        output: {
          format: conversion.format,
          path: path.relative(appDirectory, conversion.outputPath),
          sizeBytes: videoStats.size,
        },
        ...(pdfPath && pdfStats
          ? {
              pdf: {
                path: path.relative(appDirectory, pdfPath),
                sizeBytes: pdfStats.size,
              },
            }
          : {}),
        ...(documentStats.length > 0 ? { documents: documentStats } : {}),
        viewport,
      },
      null,
      2,
    )}\n`,
  )

  if (browserErrors.length > 0) {
    throw new Error(`The journey completed with browser errors:\n${browserErrors.join('\n')}`)
  }

  console.log(`Journey recording created: ${conversion.outputPath}`)
  if (pdfPath) {
    console.log(`Generated journey document: ${pdfPath}`)
  }
  for (const documentPath of documentPaths) {
    console.log(`Generated journey document: ${documentPath}`)
  }
  console.log(`Recording report: ${reportPath}`)

  return {
    artifactDirectory,
    outputPath: conversion.outputPath,
    documentPaths,
    pdfPath,
    reportPath,
  }
}

async function assertApplicationIsAvailable(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/signin`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    throw new Error(
      `SAC Nexus is not available at ${baseUrl}. Start it with "pnpm --filter web dev --host 127.0.0.1".`,
      { cause: error },
    )
  }
}

function convertToMp4(inputPath, outputPath) {
  const ffmpeg = spawnSync(
    process.env.FFMPEG_PATH ?? 'ffmpeg',
    [
      '-y',
      '-i',
      inputPath,
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '20',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-an',
      outputPath,
    ],
    {
      encoding: 'utf8',
      stdio: 'pipe',
    },
  )

  if (ffmpeg.status === 0) {
    return {
      format: 'mp4',
      outputPath,
    }
  }

  console.warn('ffmpeg was not available; keeping the Playwright WebM recording.')
  if (ffmpeg.stderr) {
    console.warn(ffmpeg.stderr.trim())
  }
  return {
    format: 'webm',
    outputPath: inputPath,
  }
}
