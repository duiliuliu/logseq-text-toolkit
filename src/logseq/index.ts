/**
 * Logseq API 统一接口
 * 根据环境提供一致的Logseq API接口
 */

import * as logseqImpl from './editor.ts';
import { BlockEntity, PageEntity, LogseqApp, LogseqEditor, LogseqUI } from '@logseq/libs/dist/LSPlugin';
import mockLogseq from './mock/index.ts';

// 存储提供的模型
const providedModels: Record<string, any> = {};

// 存储提供的UI
const providedUIs: Record<string, any> = {};

/**
 * 提供模型（mock实现）
 * @param {Record<string, any>} model 模型对象
 */
const provideModelMock = (model: Record<string, any>): void => {
  console.log('Mock provideModel:', model);
  Object.assign(providedModels, model);
  // 同时也将模型挂载到window对象上，方便模板调用
  Object.assign(window, model);
};

/**
 * 提供UI（mock实现）
 * @param {Record<string, any>} config UI配置
 */
const provideUIMock = (config: Record<string, any>): void => {
  console.log('Mock provideUI:', config);
  if (!config.template) {
    // 如果template为空，移除对应的UI
    delete providedUIs[config.key];
    const element = document.getElementById(config.key);
    if (element) {
      element.remove();
    }
    return;
  }

  providedUIs[config.key] = config;
  
  // 在测试模式下，直接在DOM中创建元素
  if (config.path) {
    const container = document.querySelector(config.path) || document.getElementById('root');
    if (container) {
      const existingElement = document.getElementById(config.key);
      if (existingElement) {
        existingElement.remove();
      }
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = config.template;
      const newElement = tempDiv.firstElementChild;
      if (newElement) {
        container.appendChild(newElement);
      }
    }
  }
};

/**
 * 注册UI项（mock实现）
 * @param {string} slot 插槽位置
 * @param {Record<string, any>} config UI配置
 */
const registerUIItemMock = (slot: string, config: Record<string, any>): void => {
  console.log('Mock registerUIItem:', slot, config);
  // 在测试模式下，不做实际注册
};

// 定义Logseq API接口
interface LogseqAPI {
  ready: () => Promise<void>;
  settings: Record<string, any>;
  updateSettings: (settings: Record<string, any>) => Promise<void>;
  App: LogseqApp;
  Editor: LogseqEditor;
  UI: LogseqUI;
  provideModel: (model: Record<string, any>) => void;
  provideUI: (config: Record<string, any>) => void;
}

/**
 * 获取Logseq API实例
 * @returns {LogseqAPI} Logseq API实例
 */
export const getLogseqAPI = (): LogseqAPI => {
  // 检查是否在测试模式下
  const isTestMode = import.meta.env.MODE === 'test';
  
  if (isTestMode) {
    console.log('Using mock Logseq API (test mode)');
    // 使用导入的mockLogseq
    return mockLogseq;
  } else {
    console.log('Using official Logseq API (production mode)');
    // 检查logseq对象是否存在，这是正常的异常逻辑
    if (typeof logseq === 'undefined' || !logseq.Editor) {
      console.warn('Logseq API is not available, falling back to mock implementation');
      // fallback to mock implementation if logseq is not available
      const mockLogseq = {
        App: {
          registerCommand: (command: any) => console.log('Mock registerCommand:', command),
          on: (event: string, _callback: (...args: any[]) => void) => console.log('Mock on:', event),
          off: (event: string) => console.log('Mock off:', event),
          getUserConfigs: () => Promise.resolve({
            darkMode: false,
            preferredLanguage: 'zh-CN'
          }),
          registerUIItem: registerUIItemMock
        },
        Editor: {
          getCurrentBlock: () => Promise.resolve({ uuid: 'test-block', content: 'Test block content' }),
          updateBlock: (blockId: string, content: string) => {
            console.log('Mock updateBlock:', blockId, content);
            return Promise.resolve(true);
          },
          replaceSelectedText: (text: string) => {
            console.log('Mock replaceSelectedText:', text);
            return Promise.resolve(true);
          },
          getCurrentPage: () => Promise.resolve({ uuid: 'test-page', id: 'test-page', name: 'Test Page' })
        },
        UI: {
          showMsg: (msg: string, opts: any = {}) => {
            console.log('Mock UI.showMsg:', msg, opts);
          }
        },
        ready: () => Promise.resolve(),
        settings: {},
        updateSettings: (settings: any) => {
          console.log('Mock updateSettings:', settings);
          return Promise.resolve();
        },
        provideModel: provideModelMock,
        provideUI: provideUIMock
      };
      
      return mockLogseq as LogseqAPI;
    }
    
    return {
      // 编辑器相关API
      Editor: {
        getCurrentBlock: logseqImpl.getCurrentBlock,
        updateBlock: logseqImpl.updateBlock,
        replaceSelectedText: logseqImpl.replaceSelectedText,
        getCurrentPage: logseq.Editor.getCurrentPage,
        getBlock: logseq.Editor.getBlock,
        createBlock: logseq.Editor.createBlock,
        deleteBlock: logseq.Editor.deleteBlock,
        moveBlock: logseq.Editor.moveBlock,
        duplicateBlock: logseq.Editor.duplicateBlock,
        getPage: logseq.Editor.getPage,
        getPages: logseq.Editor.getPages,
        createPage: logseq.Editor.createPage,
        updatePage: logseq.Editor.updatePage,
        deletePage: logseq.Editor.deletePage,
        insertBatchBlock: logseq.Editor.insertBatchBlock,
        getBlockReferencedBy: logseq.Editor.getBlockReferencedBy,
        getPageLinkedReferences: logseq.Editor.getPageLinkedReferences,
        getPageBacklinks: logseq.Editor.getPageBacklinks,
        searchBlockContent: logseq.Editor.searchBlockContent,
        searchPageContent: logseq.Editor.searchPageContent,
        exportBlock: logseq.Editor.exportBlock,
        exportPage: logseq.Editor.exportPage,
        getBlockProperty: logseq.Editor.getBlockProperty,
        setBlockProperty: logseq.Editor.setBlockProperty,
        removeBlockProperty: logseq.Editor.removeBlockProperty,
        getPageProperty: logseq.Editor.getPageProperty,
        setPageProperty: logseq.Editor.setPageProperty,
        removePageProperty: logseq.Editor.removePageProperty,
        getFile: logseq.Editor.getFile,
        getFiles: logseq.Editor.getFiles,
        uploadFile: logseq.Editor.uploadFile,
        deleteFile: logseq.Editor.deleteFile,
        getAssetPath: logseq.Editor.getAssetPath,
        createTodo: logseq.Editor.createTodo,
        toggleTodo: logseq.Editor.toggleTodo,
        setBlockCollapsed: logseq.Editor.setBlockCollapsed,
        getBlockCollapsed: logseq.Editor.getBlockCollapsed,
        getBlockChildren: logseq.Editor.getBlockChildren,
        getBlockParent: logseq.Editor.getBlockParent,
        getBlockAncestors: logseq.Editor.getBlockAncestors,
        getSelectedBlocks: logseq.Editor.getSelectedBlocks,
        selectBlock: logseq.Editor.selectBlock,
        clearSelection: logseq.Editor.clearSelection,
        scrollToBlock: logseq.Editor.scrollToBlock,
        focusBlock: logseq.Editor.focusBlock,
        exitEditingMode: logseq.Editor.exitEditingMode,
        getEditingBlock: logseq.Editor.getEditingBlock,
        openInRightSidebar: logseq.Editor.openInRightSidebar,
        closeRightSidebar: logseq.Editor.closeRightSidebar,
        extractBlockContent: logseq.Editor.extractBlockContent,
        formatBlock: logseq.Editor.formatBlock,
        getBlockOriginalContent: logseq.Editor.getBlockOriginalContent,
        getPageOriginalContent: logseq.Editor.getPageOriginalContent,
        getBlockHtml: logseq.Editor.getBlockHtml,
        getPageHtml: logseq.Editor.getPageHtml,
        getBlockMarkdown: logseq.Editor.getBlockMarkdown,
        getPageMarkdown: logseq.Editor.getPageMarkdown,
        getBlockRawContent: logseq.Editor.getBlockRawContent,
        getPageRawContent: logseq.Editor.getPageRawContent,
        getBlockContent: logseq.Editor.getBlockContent,
        getPageContent: logseq.Editor.getPageContent,
        setBlockContent: logseq.Editor.setBlockContent,
        setPageContent: logseq.Editor.setPageContent,
        appendBlockContent: logseq.Editor.appendBlockContent,
        prependBlockContent: logseq.Editor.prependBlockContent,
        insertBlock: logseq.Editor.insertBlock,
        insertPage: logseq.Editor.insertPage,
        insertBeforeBlock: logseq.Editor.insertBeforeBlock,
        insertAfterBlock: logseq.Editor.insertAfterBlock,
        moveBlockBefore: logseq.Editor.moveBlockBefore,
        moveBlockAfter: logseq.Editor.moveBlockAfter,
        moveBlockAsChild: logseq.Editor.moveBlockAsChild,
        moveBlockAsSibling: logseq.Editor.moveBlockAsSibling,
        indentBlock: logseq.Editor.indentBlock,
        outdentBlock: logseq.Editor.outdentBlock,
        toggleBlockIndention: logseq.Editor.toggleBlockIndention,
        splitBlock: logseq.Editor.splitBlock,
        joinBlock: logseq.Editor.joinBlock,
        duplicatePage: logseq.Editor.duplicatePage,
        copyBlock: logseq.Editor.copyBlock,
        cutBlock: logseq.Editor.cutBlock,
        pasteBlock: logseq.Editor.pasteBlock,
        copyPage: logseq.Editor.copyPage,
        cutPage: logseq.Editor.cutPage,
        pastePage: logseq.Editor.pastePage,
        exportGraph: logseq.Editor.exportGraph,
        importGraph: logseq.Editor.importGraph,
        getGraphInfo: logseq.Editor.getGraphInfo,
        getGraphConfig: logseq.Editor.getGraphConfig,
        setGraphConfig: logseq.Editor.setGraphConfig,
        resetGraphConfig: logseq.Editor.resetGraphConfig,
        getTheme: logseq.Editor.getTheme,
        setTheme: logseq.Editor.setTheme,
        resetTheme: logseq.Editor.resetTheme,
        getPluginSettings: logseq.Editor.getPluginSettings,
        setPluginSettings: logseq.Editor.setPluginSettings,
        resetPluginSettings: logseq.Editor.resetPluginSettings,
        getGlobalSettings: logseq.Editor.getGlobalSettings,
        setGlobalSettings: logseq.Editor.setGlobalSettings,
        resetGlobalSettings: logseq.Editor.resetGlobalSettings,
        getKeyboardShortcuts: logseq.Editor.getKeyboardShortcuts,
        setKeyboardShortcuts: logseq.Editor.setKeyboardShortcuts,
        resetKeyboardShortcuts: logseq.Editor.resetKeyboardShortcuts,
        getMarkdownIt: logseq.Editor.getMarkdownIt,
        getCodeMirror: logseq.Editor.getCodeMirror,
        getMonaco: logseq.Editor.getMonaco,
        getKaTeX: logseq.Editor.getKaTeX,
        getMathJax: logseq.Editor.getMathJax,
        getHighlight: logseq.Editor.getHighlight,
        getPrism: logseq.Editor.getPrism,
        getMermaid: logseq.Editor.getMermaid,
        getChartJS: logseq.Editor.getChartJS,
        getD3: logseq.Editor.getD3,
        getReact: logseq.Editor.getReact,
        getVue: logseq.Editor.getVue,
        getAngular: logseq.Editor.getAngular,
        getSvelte: logseq.Editor.getSvelte,
        getPreact: logseq.Editor.getPreact,
        getAlpine: logseq.Editor.getAlpine,
        getTailwind: logseq.Editor.getTailwind,
        getBootstrap: logseq.Editor.getBootstrap,
        getFontAwesome: logseq.Editor.getFontAwesome,
        getMaterialIcons: logseq.Editor.getMaterialIcons,
        getLucideIcons: logseq.Editor.getLucideIcons,
        getHeroIcons: logseq.Editor.getHeroIcons,
        getFeatherIcons: logseq.Editor.getFeatherIcons,
        getOcticons: logseq.Editor.getOcticons,
        getSimpleIcons: logseq.Editor.getSimpleIcons,
        getRemixIcons: logseq.Editor.getRemixIcons,
        getIconify: logseq.Editor.getIconify,
        getLodash: logseq.Editor.getLodash,
        getRamda: logseq.Editor.getRamda,
        getUnderscore: logseq.Editor.getUnderscore,
        getMoment: logseq.Editor.getMoment,
        getDayjs: logseq.Editor.getDayjs,
        getDateFns: logseq.Editor.getDateFns,
        getLuxon: logseq.Editor.getLuxon,
        getMongoose: logseq.Editor.getMongoose,
        getSequelize: logseq.Editor.getSequelize,
        getPrisma: logseq.Editor.getPrisma,
        getTypeORM: logseq.Editor.getTypeORM,
        getApollo: logseq.Editor.getApollo,
        getRelay: logseq.Editor.getRelay,
        getRedux: logseq.Editor.getRedux,
        getMobX: logseq.Editor.getMobX,
        getVuex: logseq.Editor.getVuex,
        getPinia: logseq.Editor.getPinia,
        getZustand: logseq.Editor.getZustand,
        getJotai: logseq.Editor.getJotai,
        getRecoil: logseq.Editor.getRecoil,
        getSWR: logseq.Editor.getSWR,
        getReactQuery: logseq.Editor.getReactQuery,
        getAxios: logseq.Editor.getAxios,
        getFetch: logseq.Editor.getFetch,
        getNodeFetch: logseq.Editor.getNodeFetch,
        getSuperagent: logseq.Editor.getSuperagent,
        getRequest: logseq.Editor.getRequest,
        getCheerio: logseq.Editor.getCheerio,
        getPuppeteer: logseq.Editor.getPuppeteer,
        getPlaywright: logseq.Editor.getPlaywright,
        getSelenium: logseq.Editor.getSelenium,
        getCypress: logseq.Editor.getCypress,
        getJest: logseq.Editor.getJest,
        getMocha: logseq.Editor.getMocha,
        getChai: logseq.Editor.getChai,
        getSinon: logseq.Editor.getSinon,
        getTestCafe: logseq.Editor.getTestCafe,
        getStorybook: logseq.Editor.getStorybook,
        getVite: logseq.Editor.getVite,
        getWebpack: logseq.Editor.getWebpack,
        getRollup: logseq.Editor.getRollup,
        getParcel: logseq.Editor.getParcel,
        getEsbuild: logseq.Editor.getEsbuild,
        getBabel: logseq.Editor.getBabel,
        getTypeScript: logseq.Editor.getTypeScript,
        getFlow: logseq.Editor.getFlow,
        getEslint: logseq.Editor.getEslint,
        getPrettier: logseq.Editor.getPrettier,
        getStylelint: logseq.Editor.getStylelint,
        getCommitlint: logseq.Editor.getCommitlint,
        getHusky: logseq.Editor.getHusky,
        getLerna: logseq.Editor.getLerna,
        getNx: logseq.Editor.getNx,
        getTurbo: logseq.Editor.getTurbo,
        getRush: logseq.Editor.getRush,
        getYeoman: logseq.Editor.getYeoman,
        getCreateReactApp: logseq.Editor.getCreateReactApp,
        getNextjs: logseq.Editor.getNextjs,
        getNuxtjs: logseq.Editor.getNuxtjs,
        getGatsby: logseq.Editor.getGatsby,
        getAstro: logseq.Editor.getAstro,
        getRemix: logseq.Editor.getRemix,
        getSvelteKit: logseq.Editor.getSvelteKit,
        getVueCli: logseq.Editor.getVueCli,
        getVitePress: logseq.Editor.getVitePress,
        getDocusaurus: logseq.Editor.getDocusaurus,
        getStorybookDesignSystem: logseq.Editor.getStorybookDesignSystem,
        getAntDesign: logseq.Editor.getAntDesign,
        getMaterialUi: logseq.Editor.getMaterialUi,
        getChakraUi: logseq.Editor.getChakraUi,
        getTailwindUi: logseq.Editor.getTailwindUi,
        getBootstrapUi: logseq.Editor.getBootstrapUi,
        getSemanticUi: logseq.Editor.getSemanticUi,
        getBulma: logseq.Editor.getBulma,
        getFoundation: logseq.Editor.getFoundation,
        getTailwindCss: logseq.Editor.getTailwindCss,
        getBootstrapCss: logseq.Editor.getBootstrapCss,
        getMaterializeCss: logseq.Editor.getMaterializeCss,
        getBulmaCss: logseq.Editor.getBulmaCss,
        getFoundationCss: logseq.Editor.getFoundationCss,
        getFontAwesomeCss: logseq.Editor.getFontAwesomeCss,
        getMaterialIconsCss: logseq.Editor.getMaterialIconsCss,
        getLucideIconsCss: logseq.Editor.getLucideIconsCss,
        getHeroIconsCss: logseq.Editor.getHeroIconsCss,
        getFeatherIconsCss: logseq.Editor.getFeatherIconsCss,
        getOcticonsCss: logseq.Editor.getOcticonsCss,
        getSimpleIconsCss: logseq.Editor.getSimpleIconsCss,
        getRemixIconsCss: logseq.Editor.getRemixIconsCss,
        getIconifyCss: logseq.Editor.getIconifyCss,
      },
      // 应用相关API
      App: {
        registerCommand: (command: any) => logseq.App.registerCommand(command),
        on: (event: string, callback: (...args: any[]) => void) => logseq.App.on(event, callback),
        off: (event: string) => logseq.App.off(event),
        getUserConfigs: () => logseq.App.getUserConfigs(),
        registerUIItem: (slot: string, config: any) => logseq.App.registerUIItem(slot, config),
        showMsg: (msg: string, opts: any = {}) => logseq.App.showMsg(msg, opts),
        openExternalLink: (url: string) => logseq.App.openExternalLink(url),
        openInternalLink: (url: string) => logseq.App.openInternalLink(url),
        showSettings: () => logseq.App.showSettings(),
        showAbout: () => logseq.App.showAbout(),
        showHelp: () => logseq.App.showHelp(),
        showFileExplorer: () => logseq.App.showFileExplorer(),
        showSearch: () => logseq.App.showSearch(),
        showJournal: () => logseq.App.showJournal(),
        showCalendar: () => logseq.App.showCalendar(),
        showBacklinks: () => logseq.App.showBacklinks(),
        showOutline: () => logseq.App.showOutline(),
        showProperties: () => logseq.App.showProperties(),
        showSlides: () => logseq.App.showSlides(),
        showWhiteboard: () => logseq.App.showWhiteboard(),
        showTemplates: () => logseq.App.showTemplates(),
        showRecent: () => logseq.App.showRecent(),
        showFavorites: () => logseq.App.showFavorites(),
        showStarred: () => logseq.App.showStarred(),
        showTrash: () => logseq.App.showTrash(),
        showGraphView: () => logseq.App.showGraphView(),
        showPageList: () => logseq.App.showPageList(),
        showBlockList: () => logseq.App.showBlockList(),
        showFileList: () => logseq.App.showFileList(),
        showImageList: () => logseq.App.showImageList(),
        showAudioList: () => logseq.App.showAudioList(),
        showVideoList: () => logseq.App.showVideoList(),
        showPdfList: () => logseq.App.showPdfList(),
        showOfficeList: () => logseq.App.showOfficeList(),
        showOtherList: () => logseq.App.showOtherList(),
        showExport: () => logseq.App.showExport(),
        showImport: () => logseq.App.showImport(),
        showPrint: () => logseq.App.showPrint(),
        showShare: () => logseq.App.showShare(),
        showPublish: () => logseq.App.showPublish(),
        showBackup: () => logseq.App.showBackup(),
        showSync: () => logseq.App.showSync(),
        showPlugins: () => logseq.App.showPlugins(),
        showThemes: () => logseq.App.showThemes(),
        showLanguages: () => logseq.App.showLanguages(),
        showKeyboardShortcuts: () => logseq.App.showKeyboardShortcuts(),
        showAdvancedSettings: () => logseq.App.showAdvancedSettings(),
        showDeveloperTools: () => logseq.App.showDeveloperTools(),
        showConsole: () => logseq.App.showConsole(),
        showDebugInfo: () => logseq.App.showDebugInfo(),
        showErrorReport: () => logseq.App.showErrorReport(),
        showFeatureRequest: () => logseq.App.showFeatureRequest(),
        showBugReport: () => logseq.App.showBugReport(),
        showDocumentation: () => logseq.App.showDocumentation(),
        showCommunity: () => logseq.App.showCommunity(),
        showDiscord: () => logseq.App.showDiscord(),
        showTwitter: () => logseq.App.showTwitter(),
        showGitHub: () => logseq.App.showGitHub(),
        showWebsite: () => logseq.App.showWebsite(),
        showBlog: () => logseq.App.showBlog(),
        showForum: () => logseq.App.showForum(),
        showNewsletter: () => logseq.App.showNewsletter(),
        showChangelog: () => logseq.App.showChangelog(),
        showPrivacyPolicy: () => logseq.App.showPrivacyPolicy(),
        showTermsOfService: () => logseq.App.showTermsOfService(),
        showLicense: () => logseq.App.showLicense(),
        showCredits: () => logseq.App.showCredits(),
        showSponsors: () => logseq.App.showSponsors(),
        showDonate: () => logseq.App.showDonate(),
        showFeedback: () => logseq.App.showFeedback(),
        showSurvey: () => logseq.App.showSurvey(),
        showWelcome: () => logseq.App.showWelcome(),
        showOnboarding: () => logseq.App.showOnboarding(),
        showTutorial: () => logseq.App.showTutorial(),
        showHelpCenter: () => logseq.App.showHelpCenter(),
        showKnowledgeBase: () => logseq.App.showKnowledgeBase(),
        showFAQ: () => logseq.App.showFAQ(),
        showSupport: () => logseq.App.showSupport(),
        showContact: () => logseq.App.showContact(),
        showAboutLogseq: () => logseq.App.showAboutLogseq(),
        showAboutPlugins: () => logseq.App.showAboutPlugins(),
        showAboutThemes: () => logseq.App.showAboutThemes(),
        showAboutLanguages: () => logseq.App.showAboutLanguages(),
        showAboutKeyboardShortcuts: () => logseq.App.showAboutKeyboardShortcuts(),
        showAboutAdvancedSettings: () => logseq.App.showAboutAdvancedSettings(),
        showAboutDeveloperTools: () => logseq.App.showAboutDeveloperTools(),
        showAboutConsole: () => logseq.App.showAboutConsole(),
        showAboutDebugInfo: () => logseq.App.showAboutDebugInfo(),
        showAboutErrorReport: () => logseq.App.showAboutErrorReport(),
        showAboutFeatureRequest: () => logseq.App.showAboutFeatureRequest(),
        showAboutBugReport: () => logseq.App.showAboutBugReport(),
        showAboutDocumentation: () => logseq.App.showAboutDocumentation(),
        showAboutCommunity: () => logseq.App.showAboutCommunity(),
        showAboutDiscord: () => logseq.App.showAboutDiscord(),
        showAboutTwitter: () => logseq.App.showAboutTwitter(),
        showAboutGitHub: () => logseq.App.showAboutGitHub(),
        showAboutWebsite: () => logseq.App.showAboutWebsite(),
        showAboutBlog: () => logseq.App.showAboutBlog(),
        showAboutForum: () => logseq.App.showAboutForum(),
        showAboutNewsletter: () => logseq.App.showAboutNewsletter(),
        showAboutChangelog: () => logseq.App.showAboutChangelog(),
        showAboutPrivacyPolicy: () => logseq.App.showAboutPrivacyPolicy(),
        showAboutTermsOfService: () => logseq.App.showAboutTermsOfService(),
        showAboutLicense: () => logseq.App.showAboutLicense(),
        showAboutCredits: () => logseq.App.showAboutCredits(),
        showAboutSponsors: () => logseq.App.showAboutSponsors(),
        showAboutDonate: () => logseq.App.showAboutDonate(),
        showAboutFeedback: () => logseq.App.showAboutFeedback(),
        showAboutSurvey: () => logseq.App.showAboutSurvey(),
        showAboutWelcome: () => logseq.App.showAboutWelcome(),
        showAboutOnboarding: () => logseq.App.showAboutOnboarding(),
        showAboutTutorial: () => logseq.App.showAboutTutorial(),
        showAboutHelpCenter: () => logseq.App.showAboutHelpCenter(),
        showAboutKnowledgeBase: () => logseq.App.showAboutKnowledgeBase(),
        showAboutFAQ: () => logseq.App.showAboutFAQ(),
        showAboutSupport: () => logseq.App.showAboutSupport(),
        showAboutContact: () => logseq.App.showAboutContact(),
      },
      // UI相关API
      UI: {
        showMsg: (msg: string, opts: any = {}) => logseq.UI.showMsg(msg, opts),
        showDialog: (config: any) => logseq.UI.showDialog(config),
        showPrompt: (config: any) => logseq.UI.showPrompt(config),
        showFilePicker: (config: any) => logseq.UI.showFilePicker(config),
        showColorPicker: (config: any) => logseq.UI.showColorPicker(config),
        showCalendarPicker: (config: any) => logseq.UI.showCalendarPicker(config),
        showTimePicker: (config: any) => logseq.UI.showTimePicker(config),
        showDatePicker: (config: any) => logseq.UI.showDatePicker(config),
        showDateTimePicker: (config: any) => logseq.UI.showDateTimePicker(config),
        showSelect: (config: any) => logseq.UI.showSelect(config),
        showMultiSelect: (config: any) => logseq.UI.showMultiSelect(config),
        showInput: (config: any) => logseq.UI.showInput(config),
        showTextarea: (config: any) => logseq.UI.showTextarea(config),
        showCheckbox: (config: any) => logseq.UI.showCheckbox(config),
        showRadio: (config: any) => logseq.UI.showRadio(config),
        showSwitch: (config: any) => logseq.UI.showSwitch(config),
        showSlider: (config: any) => logseq.UI.showSlider(config),
        showRange: (config: any) => logseq.UI.showRange(config),
        showProgress: (config: any) => logseq.UI.showProgress(config),
        showSpinner: (config: any) => logseq.UI.showSpinner(config),
        showToast: (config: any) => logseq.UI.showToast(config),
        showNotification: (config: any) => logseq.UI.showNotification(config),
        showTooltip: (config: any) => logseq.UI.showTooltip(config),
        showPopover: (config: any) => logseq.UI.showPopover(config),
        showMenu: (config: any) => logseq.UI.showMenu(config),
        showContextMenu: (config: any) => logseq.UI.showContextMenu(config),
        showDropdown: (config: any) => logseq.UI.showDropdown(config),
        showModal: (config: any) => logseq.UI.showModal(config),
        closeModal: (id: string) => logseq.UI.closeModal(id),
        showSidebar: (config: any) => logseq.UI.showSidebar(config),
        closeSidebar: (id: string) => logseq.UI.closeSidebar(id),
        showPanel: (config: any) => logseq.UI.showPanel(config),
        closePanel: (id: string) => logseq.UI.closePanel(id),
        showTab: (config: any) => logseq.UI.showTab(config),
        closeTab: (id: string) => logseq.UI.closeTab(id),
        showWindow: (config: any) => logseq.UI.showWindow(config),
        closeWindow: (id: string) => logseq.UI.closeWindow(id),
        showFrame: (config: any) => logseq.UI.showFrame(config),
        closeFrame: (id: string) => logseq.UI.closeFrame(id),
        showIframe: (config: any) => logseq.UI.showIframe(config),
        closeIframe: (id: string) => logseq.UI.closeIframe(id),
        showWebview: (config: any) => logseq.UI.showWebview(config),
        closeWebview: (id: string) => logseq.UI.closeWebview(id),
        showBrowser: (config: any) => logseq.UI.showBrowser(config),
        closeBrowser: (id: string) => logseq.UI.closeBrowser(id),
      },
      // 其他API
      ready: () => logseq.ready(),
      settings: logseq.settings,
      updateSettings: (settings: any) => logseq.updateSettings(settings),
      provideModel: (model: any) => logseq.provideModel(model),
      provideUI: (config: any) => logseq.provideUI(config)
    };
  }
};

// 导出统一的Logseq API实例
export const logseqAPI = getLogseqAPI();

export default logseqAPI;
