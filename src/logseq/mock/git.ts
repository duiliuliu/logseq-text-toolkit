// Mock Logseq Git API

const Git: any = {
  execCommand: (args: string[]) => {
    console.log('Git.execCommand called', args)
    return Promise.resolve({
      stdout: '',
      stderr: '',
      exitCode: 0
    })
  },
  loadIgnoreFile: () => {
    console.log('Git.loadIgnoreFile called')
    return Promise.resolve('')
  },
  saveIgnoreFile: (content: string) => {
    console.log('Git.saveIgnoreFile called')
    return Promise.resolve()
  }
}

export default Git
