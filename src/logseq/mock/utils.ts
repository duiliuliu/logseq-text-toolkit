// Mock Logseq Utils API

const Utils: any = {
  toJs: (obj: {}) => {
    console.log('Utils.toJs called', obj)
    return Promise.resolve(obj)
  }
}

export default Utils
