// Mock Logseq Assets API

const Assets: any = {
  listFilesOfCurrentGraph: (exts?: string | string[]) => {
    console.log('Assets.listFilesOfCurrentGraph called', exts)
    return Promise.resolve([])
  },
  makeSandboxStorage: () => {
    console.log('Assets.makeSandboxStorage called')
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve()
    }
  },
  makeUrl: (path: string) => {
    console.log('Assets.makeUrl called', path)
    return Promise.resolve(path)
  },
  builtInOpen: (path: string) => {
    console.log('Assets.builtInOpen called', path)
    return Promise.resolve(undefined)
  }
}

export default Assets
