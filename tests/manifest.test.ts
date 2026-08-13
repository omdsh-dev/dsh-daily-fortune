import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

interface Manifest {
  name: string
  version: string
  exports: Record<string, unknown>
  dsh: {
    bundle: { patch: string }
    client: { platform: string; inject: string[] }
  }
}

describe('standalone Profile Bundle manifest', () => {
  it('declares the rc.2 bundle and self-contained client dependencies', async () => {
    const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as Manifest
    assert.equal(manifest.name, '@deepseek-ai/dsh-daily-fortune')
    assert.equal(manifest.version, '0.1.0')
    assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
    assert.equal(manifest.dsh.client.platform, 'web')
    assert.ok('./client' in manifest.exports)
    assert.ok(!manifest.dsh.client.inject.includes('@deepseek-ai/dsh-api-remotes'))
    assert.ok(!manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-connection'))
    assert.ok(!manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-settings-plugins'))
  })

  it('contains exactly one loader row', async () => {
    const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
    assert.equal(patch.match(/id:\s*daily-fortune/g)?.length, 1)
    assert.equal(patch.match(/name:\s*['"]?@deepseek-ai\/dsh-daily-fortune/g)?.length, 1)
  })
})
