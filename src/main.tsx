import '@logseq/libs'

async function main() {
  console.log('Initializing Text Toolkit Plugin')
  logseq.UI.showMsg('❤️  Message from Hello World Plugin :)')
  console.log('Text Toolkit Plugin initialized successfully')
}

// Bootstrap
logseq.ready(main).catch(console.error)
