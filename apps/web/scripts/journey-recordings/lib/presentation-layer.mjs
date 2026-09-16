export const recordingTiming = {
  brief: 450,
  action: 750,
  reading: 1_800,
  important: 2_700,
  title: 3_000,
}

export async function installPresentationLayer(page) {
  await page.evaluate(() => {
    if (document.querySelector('#sac-demo-layer')) {
      return
    }

    const style = document.createElement('style')
    style.id = 'sac-demo-style'
    style.textContent = `
      #sac-demo-layer {
        font-family: Geist Variable, Geist, system-ui, sans-serif;
        pointer-events: none;
        position: fixed;
        inset: 0;
        z-index: 2147483640;
      }
      #sac-demo-guide {
        position: absolute;
        top: 10px;
        left: 50%;
        width: min(620px, calc(100vw - 48px));
        min-height: 62px;
        transform: translateX(-50%);
        border: 1px solid rgba(79, 70, 229, 0.24);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.96);
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14);
        color: #18181b;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 14px;
        align-items: center;
        padding: 10px 14px;
        opacity: 0;
        transition: opacity 180ms ease;
        backdrop-filter: blur(12px);
      }
      #sac-demo-guide[data-visible="true"] {
        opacity: 1;
      }
      #sac-demo-guide[data-tone="success"] {
        border-color: rgba(22, 163, 74, 0.35);
      }
      #sac-demo-step {
        border-radius: 999px;
        background: #eef2ff;
        color: #4338ca;
        font-size: 12px;
        font-weight: 700;
        line-height: 1;
        padding: 8px 10px;
        white-space: nowrap;
      }
      #sac-demo-guide[data-tone="success"] #sac-demo-step {
        background: #dcfce7;
        color: #166534;
      }
      #sac-demo-title {
        font-size: 15px;
        font-weight: 750;
        letter-spacing: -0.01em;
        line-height: 1.2;
      }
      #sac-demo-description {
        color: #52525b;
        font-size: 12px;
        line-height: 1.35;
        margin-top: 3px;
      }
      #sac-demo-pointer {
        position: absolute;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        border: 3px solid white;
        border-radius: 999px;
        background: #4f46e5;
        box-shadow: 0 3px 12px rgba(15, 23, 42, 0.36);
        transform: translate(-100px, -100px);
        transition: transform 360ms cubic-bezier(.2,.8,.2,1), background 160ms ease;
      }
      #sac-demo-pointer[data-clicking="true"] {
        background: #e11d48;
      }
      #sac-demo-highlight {
        position: absolute;
        top: 0;
        left: 0;
        border: 3px solid rgba(79, 70, 229, 0.72);
        border-radius: 10px;
        box-shadow: 0 0 0 5px rgba(79, 70, 229, 0.13);
        opacity: 0;
        transition: all 260ms ease, opacity 180ms ease;
      }
      #sac-demo-highlight[data-visible="true"] {
        opacity: 1;
      }
      #sac-demo-title-card {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(9, 9, 11, 0.62);
        opacity: 0;
        transition: opacity 220ms ease;
        backdrop-filter: blur(5px);
      }
      #sac-demo-title-card[data-visible="true"] {
        opacity: 1;
      }
      #sac-demo-title-card-panel {
        width: min(720px, calc(100vw - 64px));
        border: 1px solid rgba(255, 255, 255, 0.28);
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.97);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
        padding: 38px 42px;
        text-align: center;
      }
      #sac-demo-title-card[data-tone="success"] #sac-demo-title-card-panel {
        border-color: rgba(22, 163, 74, 0.48);
      }
      #sac-demo-title-card-eyebrow {
        color: #4f46e5;
        font-size: 13px;
        font-weight: 750;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      #sac-demo-title-card[data-tone="success"] #sac-demo-title-card-eyebrow {
        color: #15803d;
      }
      #sac-demo-title-card-heading {
        color: #18181b;
        font-size: 34px;
        font-weight: 800;
        letter-spacing: -0.035em;
        line-height: 1.08;
        margin-top: 12px;
      }
      #sac-demo-title-card-description {
        color: #52525b;
        font-size: 17px;
        line-height: 1.5;
        margin-top: 14px;
      }
    `

    const layer = document.createElement('div')
    layer.id = 'sac-demo-layer'
    layer.setAttribute('aria-hidden', 'true')
    layer.innerHTML = `
      <div id="sac-demo-highlight"></div>
      <div id="sac-demo-pointer"></div>
      <div id="sac-demo-guide">
        <div id="sac-demo-step"></div>
        <div>
          <div id="sac-demo-title"></div>
          <div id="sac-demo-description"></div>
        </div>
      </div>
      <div id="sac-demo-title-card">
        <div id="sac-demo-title-card-panel">
          <div id="sac-demo-title-card-eyebrow"></div>
          <div id="sac-demo-title-card-heading"></div>
          <div id="sac-demo-title-card-description"></div>
        </div>
      </div>
    `
    document.head.append(style)
    document.body.append(layer)
  })
}

export async function showGuide(page, { step, title, description, tone = 'default' }) {
  await installPresentationLayer(page)
  await page.evaluate(
    ({ stepText, titleText, descriptionText, guideTone }) => {
      const guide = document.querySelector('#sac-demo-guide')
      const stepElement = document.querySelector('#sac-demo-step')
      const titleElement = document.querySelector('#sac-demo-title')
      const descriptionElement = document.querySelector('#sac-demo-description')
      const highlight = document.querySelector('#sac-demo-highlight')
      if (!guide || !stepElement || !titleElement || !descriptionElement || !highlight) {
        return
      }
      stepElement.textContent = stepText
      titleElement.textContent = titleText
      descriptionElement.textContent = descriptionText
      guide.setAttribute('data-tone', guideTone)
      guide.setAttribute('data-visible', 'true')
      highlight.setAttribute('data-visible', 'false')
    },
    {
      descriptionText: description,
      guideTone: tone,
      stepText: step,
      titleText: title,
    },
  )
  await page.waitForTimeout(recordingTiming.brief)
}

export async function showTitleCard(page, { eyebrow, title, description, tone = 'default' }) {
  await installPresentationLayer(page)
  await page.evaluate(
    ({ eyebrowText, titleText, descriptionText, cardTone }) => {
      const card = document.querySelector('#sac-demo-title-card')
      const eyebrowElement = document.querySelector('#sac-demo-title-card-eyebrow')
      const titleElement = document.querySelector('#sac-demo-title-card-heading')
      const descriptionElement = document.querySelector('#sac-demo-title-card-description')
      const guide = document.querySelector('#sac-demo-guide')
      const highlight = document.querySelector('#sac-demo-highlight')
      if (
        !card ||
        !eyebrowElement ||
        !titleElement ||
        !descriptionElement ||
        !guide ||
        !highlight
      ) {
        return
      }
      eyebrowElement.textContent = eyebrowText
      titleElement.textContent = titleText
      descriptionElement.textContent = descriptionText
      card.setAttribute('data-tone', cardTone)
      card.setAttribute('data-visible', 'true')
      guide.setAttribute('data-visible', 'false')
      highlight.setAttribute('data-visible', 'false')
    },
    {
      cardTone: tone,
      descriptionText: description,
      eyebrowText: eyebrow,
      titleText: title,
    },
  )
  await page.waitForTimeout(recordingTiming.title)
  await page.evaluate(() => {
    document.querySelector('#sac-demo-title-card')?.setAttribute('data-visible', 'false')
  })
  await page.waitForTimeout(recordingTiming.brief)
}

export async function guidedClick(page, locator) {
  await highlightLocator(page, locator)
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error('Unable to point to an element that has no bounding box.')
  }
  await page.evaluate(
    ({ x, y }) => {
      const pointer = document.querySelector('#sac-demo-pointer')
      pointer?.setAttribute(
        'style',
        `transform: translate(${Math.round(x - 10)}px, ${Math.round(y - 10)}px)`,
      )
    },
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  )
  await page.waitForTimeout(recordingTiming.brief)
  await page.evaluate(() => {
    document.querySelector('#sac-demo-pointer')?.setAttribute('data-clicking', 'true')
  })
  await page.waitForTimeout(160)
  await locator.click()
  await page.evaluate(() => {
    document.querySelector('#sac-demo-pointer')?.setAttribute('data-clicking', 'false')
  })
  await page.waitForTimeout(recordingTiming.action)
}

export async function guidedType(page, locator, value) {
  await highlightLocator(page, locator)
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error('Unable to point to an input that has no bounding box.')
  }
  await page.evaluate(
    ({ x, y }) => {
      const pointer = document.querySelector('#sac-demo-pointer')
      pointer?.setAttribute(
        'style',
        `transform: translate(${Math.round(x - 10)}px, ${Math.round(y - 10)}px)`,
      )
    },
    { x: box.x + Math.min(box.width * 0.25, 130), y: box.y + box.height / 2 },
  )
  await page.waitForTimeout(recordingTiming.brief)
  await locator.click()
  await locator.fill('')
  await locator.pressSequentially(value, { delay: 48 })
  await page.waitForTimeout(recordingTiming.action)
}

export async function highlightLocator(page, locator) {
  await installPresentationLayer(page)
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error('Unable to highlight an element that has no bounding box.')
  }
  await page.evaluate(({ height, width, x, y }) => {
    const highlight = document.querySelector('#sac-demo-highlight')
    if (!highlight) {
      return
    }
    highlight.setAttribute(
      'style',
      [
        `height:${Math.round(height + 12)}px`,
        `transform:translate(${Math.round(x - 6)}px, ${Math.round(y - 6)}px)`,
        `width:${Math.round(width + 12)}px`,
      ].join(';'),
    )
    highlight.setAttribute('data-visible', 'true')
  }, box)
  await page.waitForTimeout(260)
}
