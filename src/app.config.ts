export default defineAppConfig({
  pages: ['pages/index/index', 'pages/mine/index', 'pages/eventChannel/index'],
  subPackages: [],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#000',
    selectedColor: '#104fcc',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/index/index',
        iconPath: './assets/icon-image/tabbar/index.webp',
        selectedIconPath: './assets/icon-image/tabbar/selectIndex.webp',
        text: '首页',
      },
      {
        pagePath: 'pages/mine/index',
        iconPath: './assets/icon-image/tabbar/mine.webp',
        selectedIconPath: './assets/icon-image/tabbar/selectMine.webp',
        text: '我的',
      },
    ],
  },
  lazyCodeLoading: 'requiredComponents',
})
