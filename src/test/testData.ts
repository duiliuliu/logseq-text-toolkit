import { ToolbarItem, ToolbarGroup } from '../components/Toolbar/types.ts';

export const toolbarItems: Array<ToolbarItem | ToolbarGroup> = [
  {
    id: 'wrap-bold',
    label: '加粗',
    binding: '',
    icon: 'bold',
    funcmode: 'replace',
    clickfunc: '**${selectedText}**',
    invoke: 'replace',
    invokeParams: '**${selectedText}**'
  },
  {
    id: 'group-style',
    label: '样式',
    icon: 'menu',
    invoke: 'replace',
    invokeParams: '',
    subItems: [
      {
        id: 'wrap-italic',
        label: '斜体',
        binding: 'mod+shift+i',
        icon: 'italic',
        funcmode: 'replace',
        clickfunc: '*${selectedText}*',
        invoke: 'replace',
        invokeParams: '*${selectedText}*'
      },
      {
        id: 'wrap-underline',
        label: '下划线',
        binding: '',
        icon: 'underline',
        funcmode: 'replace',
        clickfunc: '__${selectedText}__',
        invoke: 'replace',
        invokeParams: '__${selectedText}__'
      },
      {
        id: 'wrap-strike-through',
        label: '删除线',
        binding: '',
        icon: 'strikethrough',
        funcmode: 'replace',
        clickfunc: '~~${selectedText}~~',
        invoke: 'replace',
        invokeParams: '~~${selectedText}~~'
      }
    ]
  },
  {
    id: 'group-hl',
    label: '高亮',
    icon: 'highlighter',
    invoke: 'replace',
    invokeParams: '',
    subItems: [
      {
        id: 'wrap-yellow-hl',
        label: '黄色高亮',
        binding: '',
        icon: 'highlighter',
        funcmode: 'replace',
        clickfunc: '==${selectedText}==',
        invoke: 'replace',
        invokeParams: '==${selectedText}=='
      },
      {
        id: 'wrap-red-hl',
        label: '红色高亮',
        binding: '',
        icon: 'highlighter',
        funcmode: 'replace',
        clickfunc: '[:mark.red ${selectedText}]',
        invoke: 'replace',
        invokeParams: '[:mark.red ${selectedText}]'
      },
      {
        id: 'wrap-blue-hl',
        label: '蓝色高亮',
        binding: '',
        icon: 'highlighter',
        funcmode: 'replace',
        clickfunc: '[:mark.blue ${selectedText}]',
        invoke: 'replace',
        invokeParams: '[:mark.blue ${selectedText}]'
      },
      {
        id: 'wrap-green-hl',
        label: '绿色高亮',
        binding: '',
        icon: 'highlighter',
        funcmode: 'replace',
        clickfunc: '[:mark.green ${selectedText}]',
        invoke: 'replace',
        invokeParams: '[:mark.green ${selectedText}]'
      },
      {
        id: 'wrap-purple-hl',
        label: '紫色高亮',
        binding: '',
        icon: 'highlighter',
        funcmode: 'replace',
        clickfunc: '[:mark.purple ${selectedText}]',
        invoke: 'replace',
        invokeParams: '[:mark.purple ${selectedText}]'
      }
    ]
  },
  {
    id: 'group-text',
    label: '文本',
    icon: 'type',
    invoke: 'replace',
    invokeParams: '',
    subItems: [
      {
        id: 'wrap-red-text',
        label: '红色文本',
        binding: '',
        icon: 'type',
        funcmode: 'replace',
        clickfunc: '[[:color.red ${selectedText}]]',
        invoke: 'replace',
        invokeParams: '[[:color.red ${selectedText}]]'
      },
      {
        id: 'wrap-blue-text',
        label: '蓝色文本',
        binding: '',
        icon: 'type',
        funcmode: 'replace',
        clickfunc: '[[:color.blue ${selectedText}]]',
        invoke: 'replace',
        invokeParams: '[[:color.blue ${selectedText}]]'
      },
      {
        id: 'wrap-yellow-text',
        label: '黄色文本',
        binding: '',
        icon: 'type',
        funcmode: 'replace',
        clickfunc: '[[:color.yellow ${selectedText}]]',
        invoke: 'replace',
        invokeParams: '[[:color.yellow ${selectedText}]]'
      },
      {
        id: 'wrap-green-text',
        label: '绿色文本',
        binding: '',
        icon: 'type',
        funcmode: 'replace',
        clickfunc: '[[:color.green ${selectedText}]]',
        invoke: 'replace',
        invokeParams: '[[:color.green ${selectedText}]]'
      },
      {
        id: 'wrap-purple-text',
        label: '紫色文本',
        binding: '',
        icon: 'type',
        funcmode: 'replace',
        clickfunc: '[[:color.purple ${selectedText}]]',
        invoke: 'replace',
        invokeParams: '[[:color.purple ${selectedText}]]'
      }
    ]
  },
  {
    id: 'group-underline',
    label: '下划线',
    icon: 'underline',
    invoke: 'replace',
    invokeParams: '',
    subItems: [
      {
        id: 'wrap-red-underline',
        label: '红色下划线',
        binding: '',
        icon: 'underline',
        funcmode: 'replace',
        clickfunc: '[:mark.red-underline ${selectedText}]',
        invoke: 'replace',
        invokeParams: '[:mark.red-underline ${selectedText}]'
      },
      {
        id: 'wrap-yellow-underline',
        label: '黄色下划线',
        binding: '',
        icon: 'underline',
        funcmode: 'replace',
        clickfunc: '[:mark.yellow-underline ${selectedText}]',
        invoke: 'replace',
        invokeParams: '[:mark.yellow-underline ${selectedText}]'
      },
      {
        id: 'wrap-blue-underline',
        label: '蓝色下划线',
        binding: '',
        icon: 'underline',
        funcmode: 'replace',
        clickfunc: '[:mark.blue-underline ${selectedText}]',
        invoke: 'replace',
        invokeParams: '[:mark.blue-underline ${selectedText}]'
      },
      {
        id: 'wrap-green-underline',
        label: '绿色下划线',
        binding: '',
        icon: 'underline',
        funcmode: 'replace',
        clickfunc: '[:mark.green-underline ${selectedText}]',
        invoke: 'replace',
        invokeParams: '[:mark.green-underline ${selectedText}]'
      },
      {
        id: 'wrap-purple-underline',
        label: '紫色下划线',
        binding: '',
        icon: 'underline',
        funcmode: 'replace',
        clickfunc: '[:mark.purple-underline ${selectedText}]',
        invoke: 'replace',
        invokeParams: '[:mark.purple-underline ${selectedText}]'
      }
    ]
  },
  {
    id: 'wrap-file-link',
    label: '文件链接',
    binding: '',
    icon: 'menu',
    funcmode: 'replace',
    clickfunc: '[[${selectedText}]]',
    invoke: 'replace',
    invokeParams: '[[${selectedText}]]'
  },
  {
    id: 'wrap-cloze',
    label: '挖空',
    binding: '',
    icon: 'menu',
    funcmode: 'replace',
    clickfunc: ' {{cloze ${selectedText}}}',
    invoke: 'replace',
    invokeParams: ' {{cloze ${selectedText}}}'
  },
  {
    id: 'repl-clear',
    label: '清除格式',
    binding: 'mod+shift+x',
    icon: 'x',
    funcmode: 'replace',
    clickfunc: '',
    regex: '\[\[(?:#|\$)(?:red|green|blue)\]\]|==([^=]*)==|~~([^~]*)~~|\^\^([^\^]*)\^\^|\*\*([^\*]*)\*\*|\*([^\*]*)\*|_([^_]*)_|\$([^\$]*)\$|`([^`]*)`',
    replacement: '$1$2$3$4$5$6$7$8',
    invoke: 'replace',
    invokeParams: ''
  },
  {
    id: 'wrap-code',
    label: '代码块',
    binding: 'mod+shift+c',
    icon: 'type',
    funcmode: 'replace',
    clickfunc: '```\n${selectedText}\n```',
    hidden: true,
    invoke: 'replace',
    invokeParams: '```\n${selectedText}\n```'
  },
  {
    id: 'wrap-quote',
    label: '引用',
    binding: 'mod+shift+q',
    icon: 'menu',
    funcmode: 'replace',
    clickfunc: '> ${selectedText}',
    hidden: true,
    invoke: 'replace',
    invokeParams: '> ${selectedText}'
  }
];