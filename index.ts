import { spawn } from 'node:child_process'

const scripts = [
  './budget.ts',
  './comeuroint.ts',
  './crimecor.ts',
  './kno.ts',
  './komagropolit.ts',
  './komekolog.ts',
  './komfinbank.ts',
  './komit.ts',
  './kompek.ts',
  './kompkd.ts',
  './kompravlud.ts',
  './kompravpol.ts',
  './komprompol.ts',
  './komsamovr.ts',
  './komspip.ts',
  './komsport.ts',
  './komsvobslova.ts',
  './komtrans.ts',
  './komzak.ts',
  './komzakonpr.ts',
  './komzdrav.ts',
  './reglament.ts'
]

const runScript = (script: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      stdio: 'inherit',
    })

    child.on('error', reject)

    child.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${script} exited with code ${code}`))
      }
    })
  })

for (const script of scripts) {
  console.log(`Running ${script}`)
  await runScript(script)
}
